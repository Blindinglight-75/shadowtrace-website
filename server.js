require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// Trust proxy (for Railway)
app.set('trust proxy', 1);

// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// System prompt with ShadowTrace knowledge
const SYSTEM_PROMPT = `You are an AI assistant for ShadowTrace, a blockchain intelligence platform for financial crime investigators. You help visitors understand ShadowTrace's capabilities and determine if it's right for their needs.

## About ShadowTrace
ShadowTrace is a blockchain intelligence platform that helps law enforcement, compliance teams, exchanges, and regulators investigate cryptocurrency transactions.

## Core Features
- **Visual Transaction Tracing**: Interactive graph-based investigation of fund flows across wallets and chains
- **Multi-Chain Support**: Bitcoin, Ethereum, Tron, and 40+ blockchain networks
- **Explainable Risk Scoring**: Every risk indicator comes with clear reasoning factors (direct exposure, behavioural patterns, counterparty risk, mixer usage)
- **Real-Time Monitoring**: Watchlists and alerts for addresses of interest
- **Evidence-Grade Reporting**: Court-ready PDF reports with methodology documentation, timestamped screenshots, and audit trails
- **Entity Resolution**: Link addresses to known exchanges, services, and flagged actors
- **Shared Case Workspaces**: Team collaboration with annotations, tags, and role-based access

## Who Uses ShadowTrace
1. **Law Enforcement**: Building prosecutable cases, tracing illicit funds, supporting asset seizure applications
2. **Financial Institutions**: Compliance workflows, counterparty risk assessment, SAR documentation
3. **Crypto Exchanges/VASPs**: Customer screening, Travel Rule compliance, law enforcement response
4. **Regulators**: Market supervision, cross-border fund flow analysis

## Pricing Tiers
- **Starter/Pilot**: For evaluation, up to 3 seats, basic features - ideal for proof of concept
- **Professional**: Up to 15 seats, real-time alerts, explainable scoring, API access
- **Enterprise**: Unlimited seats, SSO/SAML, private cloud/on-premises deployment options

For specific pricing, suggest contacting the team for a quote tailored to their needs.

## Security & Compliance
- SOC 2 Type II and ISO 27001 certified
- AES-256 encryption at rest, TLS 1.3 in transit
- GDPR compliant, data residency options (EU, US, UK)
- SSO/SAML support, role-based access controls

## Deployment Options
- Cloud SaaS (multi-region)
- Private Cloud / VPC
- On-Premises / Air-Gapped

## Key Differentiators vs Competitors
- **Accessible Pricing**: Designed for agencies and teams without enterprise budgets
- **Explainable Risk**: Every score includes clear reasoning, not just a number
- **Hands-On Support**: Dedicated onboarding and ongoing assistance

## Your Behaviour Guidelines
1. Be helpful, professional, and concise
2. Focus on how ShadowTrace can solve specific problems
3. If asked about competitors, be factual but highlight ShadowTrace's differentiators
4. For detailed pricing, suggest requesting a demo or contacting the team
5. For technical questions you cannot answer, offer to connect them with the team
6. Encourage visitors to request a demo when appropriate
7. Do not make up features or capabilities not listed above
8. Keep responses under 150 words unless more detail is specifically requested
9. Use British English spelling (e.g., behaviour, organisation, colour)`;

// Rate limiting (simple in-memory)
const rateLimits = new Map();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip) {
    const now = Date.now();
    const userLimit = rateLimits.get(ip) || { count: 0, resetTime: now + RATE_WINDOW };

    if (now > userLimit.resetTime) {
        userLimit.count = 0;
        userLimit.resetTime = now + RATE_WINDOW;
    }

    userLimit.count++;
    rateLimits.set(ip, userLimit);

    return userLimit.count <= RATE_LIMIT;
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;

        if (!checkRateLimit(ip)) {
            return res.status(429).json({
                error: 'Too many requests. Please wait a moment before trying again.'
            });
        }

        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Validate message format
        for (const msg of messages) {
            if (!msg.role || !msg.content) {
                return res.status(400).json({ error: 'Invalid message format' });
            }
            if (!['user', 'assistant'].includes(msg.role)) {
                return res.status(400).json({ error: 'Invalid message role' });
            }
        }

        // Limit conversation history
        const recentMessages = messages.slice(-10);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...recentMessages
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const reply = completion.choices[0]?.message?.content || 'I apologise, I couldn\'t generate a response.';

        res.json({ reply });

    } catch (error) {
        console.error('Chat API error:', error);

        if (error.code === 'insufficient_quota') {
            return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
        }

        res.status(500).json({ error: 'An error occurred processing your request.' });
    }
});

// Lead capture endpoint
app.post('/api/lead', async (req, res) => {
    try {
        const { email, name, conversation, pageUrl } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Format conversation for email
        const transcript = conversation
            .map(msg => `${msg.role === 'user' ? 'Visitor' : 'Assistant'}: ${msg.content}`)
            .join('\n\n');

        const leadData = {
            email,
            name: name || 'Not provided',
            pageUrl: pageUrl || 'Unknown',
            timestamp: new Date().toISOString(),
            transcript
        };

        // Log the lead (in production, send to webhook/email service)
        console.log('New lead captured:', JSON.stringify(leadData, null, 2));

        // If webhook URL is configured, send data there
        if (process.env.LEAD_WEBHOOK_URL) {
            try {
                await fetch(process.env.LEAD_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData)
                });
            } catch (webhookError) {
                console.error('Webhook error:', webhookError);
            }
        }

        res.json({ success: true, message: 'Thank you! We\'ll be in touch soon.' });

    } catch (error) {
        console.error('Lead API error:', error);
        res.status(500).json({ error: 'Failed to submit lead' });
    }
});

// Serve static files (HTML, CSS, JS, assets)
app.use(express.static(path.join(__dirname), {
    extensions: ['html'],
    index: 'index.html'
}));

// Fallback to index.html for SPA-like behavior (optional)
app.get('*', (req, res) => {
    // If it looks like a file request, send 404
    if (req.path.includes('.')) {
        return res.status(404).sendFile(path.join(__dirname, '404.html'));
    }
    // Otherwise try to serve the HTML file
    const htmlPath = path.join(__dirname, req.path + '.html');
    res.sendFile(htmlPath, err => {
        if (err) {
            res.status(404).sendFile(path.join(__dirname, '404.html'));
        }
    });
});

app.listen(PORT, () => {
    console.log(`ShadowTrace website running on port ${PORT}`);
});
