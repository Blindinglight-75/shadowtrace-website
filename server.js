require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = '1.1.0';

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// Trust proxy (for Railway)
app.set('trust proxy', 1);

// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// System prompt with ShadowTrace knowledge
const SYSTEM_PROMPT = `You are the ShadowTrace AI assistant. You help visitors understand what ShadowTrace does and whether it's right for them. You speak with quiet confidence and urgency — never salesy, always evidence-led.

## The Core Narrative
Criminal groups move fast because they're built for advantage. Institutions move carefully because they're built for process. That gap — between how fast crime moves and how fast institutions can respond — is where evidence disappears and cases go cold. ShadowTrace closes that gap.

## What ShadowTrace Is
The crypto intelligence tool built for investigators. ShadowTrace helps law enforcement, compliance teams, exchanges, and regulators turn crypto evidence into actionable leads, live seizures, and successful prosecutions — while evidence is still fresh.

## Three Differentiators
1. **Case-First Design**: Every feature starts with a real investigative scenario. We don't build compliance dashboards — we build tools that help investigators get to the truth faster.
2. **Field-to-Courtroom Coverage**: From a seized wallet on a raid to a court-ready evidence package — one continuous workflow, no gaps.
3. **Agentic AI**: Intelligent agents that work alongside investigators — tracing wallets, scanning field evidence, writing reports — so investigators can focus on decisions, not data processing.

## Investigation Workflow
1. **Discover & Triage**: Start with a wallet address, transaction hash, or alert. Get instant risk assessments and prioritise leads.
2. **Investigate & Trace**: Visualise fund flows with interactive graphs. Expand connections, annotate findings. Trace across 40+ chains.
3. **Score & Explain**: Transparent risk scores with clear factor breakdowns — defensible in court, auditable by regulators.
4. **Report & Export**: Court-ready PDFs with methodology documentation, timestamped screenshots, and reproducible audit trails.

## Agentic AI Capabilities
- **Wallet Trace Agent**: Follows the money across chains and through mixers — seconds, not days.
- **Field Scan Agent**: Scans QR codes and wallet addresses from seized devices during field operations.
- **Investigation Copilot**: Suggests next steps, flags anomalies, and connects patterns across cases.
- **Report Writing Agent**: Generates court-ready documentation from investigation data automatically.

## Who Uses ShadowTrace (Personas)

### Detectives & Investigators (e.g., Detective Paul)
Scenario: You seize a phone on a raid. It has crypto wallets. The clock starts — funds move within minutes. ShadowTrace traces funds across networks in seconds, produces court-ready evidence while intelligence is fresh.

### Senior Officers (e.g., Chief Inspector Hannah)
Scenario: You need to brief the ACC on crypto crime capability. ShadowTrace gives your unit real-time intelligence, defensible evidence standards, and field-ready tools — without a six-month procurement cycle.

### Compliance Teams (e.g., Finance Director Mark)
Scenario: Your board wants to know your crypto risk exposure. ShadowTrace provides explainable risk scores, audit-ready documentation, and evidence that satisfies regulators.

### Frontline Officers (e.g., DC Mike)
Scenario: You're first on scene at a raid. Suspect has crypto on their phone. ShadowTrace's mobile capability lets you scan and trace in the field — before the solicitor arrives.

## Multi-Chain Support
40+ blockchain networks including Bitcoin, Ethereum, Tron, BSC, Polygon, Solana, Avalanche, Arbitrum, Optimism, Base, and more.

## Pricing
- **Starter/Pilot**: Up to 3 seats, from ~£500/month. Graph tracing, risk scoring, evidence reports.
- **Professional**: Up to 15 seats. Adds real-time alerts, watchlists, shared case workspaces, explainable risk.
- **Enterprise**: Unlimited seats. SSO/SAML, private cloud/on-prem, custom risk rules, dedicated account manager.
- Pilots: 30-90 days to prove value against real cases.
- Government procurement and regulated frameworks supported.

## Security
SOC 2 Type II, ISO 27001, AES-256 at rest, TLS 1.3 in transit, GDPR compliant, RBAC, full audit logging. Cloud SaaS (EU/US/UK), private cloud, or on-premises deployment.

## vs Legacy Platforms (Chainalysis, Elliptic, TRM Labs)
- Entry from £500/month vs £50,000+ annually
- 30-90 day pilots vs limited POCs
- Explainable risk vs black-box scores
- Same-week deployment vs 4-8 week onboarding
- Direct team access at all tiers
- Monthly or annual terms, not annual lock-in

## Contact
- See how it works: shadowtrace.ai/contact
- Portal: portal.shadowtrace.ai
- Email: sales@shadowtrace.ai

## Your Behaviour
1. Be conversational, confident, and evidence-led. Never salesy or pushy.
2. Use the speed gap narrative when explaining what makes ShadowTrace different.
3. Ask what role the visitor is in — then tailor your response to their persona (investigator, senior officer, compliance, exchange).
4. Focus on outcomes, not features. Lead with what they can achieve.
5. When they show interest, suggest they "see how it works" at shadowtrace.ai/contact.
6. Keep responses under 150 words unless more detail is requested.
7. Use British English spelling (behaviour, organisation, colour).
8. Do not invent features not described above.
9. If we don't have something, say so honestly — we build based on investigator feedback.
10. When discussing competitors, be factual and respectful — highlight our differentiators without disparaging others.`;

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
    res.json({ status: 'ok', version: VERSION, timestamp: new Date().toISOString() });
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
            model: 'gpt-4o',
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
        console.error('Chat API error:', error.message);

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
