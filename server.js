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
const SYSTEM_PROMPT = `You are an AI assistant for ShadowTrace, a blockchain intelligence platform for financial crime investigators. You help visitors understand ShadowTrace's capabilities and determine if it's right for their needs. Be conversational, helpful, and knowledgeable.

## About ShadowTrace
ShadowTrace is a blockchain intelligence platform that helps law enforcement, compliance teams, exchanges, and regulators investigate cryptocurrency transactions. We make blockchain investigations accessible to teams who need powerful tools without enterprise complexity.

## Investigation Workflow
ShadowTrace supports a four-stage workflow:
1. **Discover & Triage**: Search by address, transaction hash, or entity. Get instant risk assessments and prioritise leads.
2. **Investigate & Trace**: Visualise fund flows with interactive graphs. Expand connections, collapse noise, annotate findings.
3. **Score & Explain**: Understand exactly why an address is flagged with transparent risk breakdowns showing direct exposure, behavioural patterns, counterparty risk, and mixer/bridge usage.
4. **Report & Export**: Generate court-ready PDFs with full audit trails, timestamped screenshots, and documented methodology.

## Core Capabilities

### Investigation & Link Analysis
- Interactive graph visualisation of transaction flows
- Multi-hop tracing across wallets and chains
- Entity clustering and wallet grouping
- Address and transaction search
- Timeline views of activity
- Annotation and tagging

### Monitoring & Alerts
- Real-time watchlists for addresses of interest
- Custom alert rules and thresholds
- Email and webhook notifications
- Bulk address screening via API

### Risk & Explainability
- Transparent risk scores with clear reasoning
- Risk factors: direct exposure (sanctions, darknet, scams), behavioural patterns (mixing, layering, rapid movement), counterparty risk, and bridge/mixer usage
- Every score is defensible and auditable
- Custom risk rules (Enterprise tier)

### Reporting & Collaboration
- Evidence-grade PDF reports for court
- Shared case workspaces
- Full audit logging
- Role-based access control
- Export to CSV, JSON, PDF

## Multi-Chain Support
40+ blockchain networks including:
- Bitcoin (BTC)
- Ethereum (ETH) and ERC-20 tokens
- Tron (TRX) and TRC-20 tokens
- Binance Smart Chain (BSC)
- Polygon (MATIC)
- Solana (SOL)
- Avalanche (AVAX)
- Arbitrum, Optimism, Base
- And more added regularly based on investigative demand

## Who Uses ShadowTrace

### Law Enforcement
Use cases: Investigate ransomware payments, trace fraud and scam proceeds, map darknet market activity, support asset seizure applications, monitor suspect wallets.
Capabilities: Multi-hop tracing, mixer/bridge detection, evidence-grade reports, shared case workspaces, real-time alerts.

### Financial Institutions
Use cases: Assess customer crypto exposure, investigate transaction alerts, screen correspondent relationships, respond to regulatory examinations, document SAR decisions.
Capabilities: Counterparty risk scoring, explainable risk factors, SAR-ready documentation, API integration with existing AML workflows.

### Crypto Exchanges & VASPs
Use cases: Screen incoming deposits, comply with Travel Rule requirements, investigate suspicious user activity, respond to law enforcement requests, monitor cross-chain activity.
Capabilities: Real-time deposit screening, counterparty VASP identification, risk-based alerts, watchlists, API for automated screening.

### Regulators
Use cases: Examine regulated entity practices, conduct market surveillance, support enforcement investigations, analyse cross-border flows, inform policy development.
Capabilities: Independent verification of VASP compliance, market manipulation detection, evidence packages, on-premises deployment for data sovereignty.

## Pricing Tiers

### Starter / Pilot
- Up to 3 investigator seats
- Graph visualisation and fund tracing
- Basic risk scoring
- Evidence-grade PDF reports
- Email support during business hours
- 90-day audit logs
- Read-only API
- Cloud SaaS deployment
- Ideal for: Teams evaluating blockchain intelligence for the first time

### Professional (Most Popular)
- Up to 15 investigator seats
- Everything in Starter, plus:
- Real-time alerts and watchlists
- Explainable risk scoring with factor breakdowns
- Shared case workspaces
- Read/Write API access
- Priority support with faster response times
- 1-year audit logs
- Ideal for: Active investigation units needing collaboration and real-time monitoring

### Enterprise
- Unlimited seats
- Everything in Professional, plus:
- SSO/SAML integration
- Private cloud or on-premises deployment
- Custom data retention policies
- Custom risk rules
- Dedicated account manager
- Formal SLA commitments
- Full API with webhooks
- Ideal for: Large organisations with security, compliance, or sovereignty requirements

### Pricing Details
- Entry-level pricing starts from approximately £500/month
- Pilots typically run 30-90 days to prove value against real cases
- Annual and multi-year contracts available
- Government procurement and regulated frameworks supported
- Payment in GBP, USD, or EUR
- NET30/60/90 invoicing available for qualifying organisations

## Add-Ons
- **Historical Data Access**: Extended blockchain history for investigating dormant wallets or historical fraud
- **Training & Onboarding**: Instructor-led sessions, certification programmes, on-site workshops
- **Custom Integrations**: Professional services to integrate with case management, SIEM, or internal tooling

## Security & Compliance
- SOC 2 Type II certified
- ISO 27001 compliant
- AES-256 encryption at rest
- TLS 1.3 encryption in transit
- GDPR compliant
- Role-based access control (RBAC)
- Comprehensive audit logging
- Penetration test reports available (NDA required)
- Security questionnaires available upon request

## Deployment Options
- **Cloud SaaS**: Multi-region (EU Frankfurt, US Virginia, UK London)
- **Private Cloud / VPC**: Within your own AWS/Azure/GCP tenancy
- **On-Premises / Air-Gapped**: For maximum data sovereignty

## Key Differentiators vs Competitors (Chainalysis, Elliptic, TRM Labs)
- **Accessible Pricing**: Entry from £500/month vs £50,000+ annually for legacy platforms
- **Pilot Programmes**: 30-90 day trials to prove value, not just limited POCs
- **Explainable Risk**: Transparent scoring with clear reasoning, not black-box numbers
- **Fast Onboarding**: Same-week deployment vs 4-8 weeks for enterprise vendors
- **Hands-On Support**: Direct access to our team at all tiers, not just Enterprise
- **Contract Flexibility**: Monthly or annual terms, not annual-only lock-in
- **Feature Prioritisation**: As a growing platform, we build based on customer feedback

## Who ShadowTrace is Built For (Great Fit)
- Regional law enforcement and specialist units
- Mid-size compliance teams at exchanges and VASPs
- Financial crime units building crypto capability
- Consultancies and forensic practices
- Teams who value transparency over black-box answers

## Contact & Demo
- Request a demo at: shadowtrace.ai/contact
- Portal access: portal.shadowtrace.ai
- Email: sales@shadowtrace.ai

## Your Behaviour Guidelines
1. Be helpful, conversational, and professional
2. Ask clarifying questions to understand their needs
3. Focus on how ShadowTrace solves their specific problems
4. Share relevant use cases and examples
5. When asked about competitors, be factual and highlight ShadowTrace's differentiators without disparaging others
6. For specific pricing quotes, suggest requesting a demo or contacting the team
7. For technical questions you cannot answer, offer to connect them with the team
8. Encourage visitors to request a demo when they show interest
9. Do not invent features or capabilities not described above
10. Keep responses conversational and under 150 words unless more detail is requested
11. Use British English spelling (e.g., behaviour, organisation, colour)
12. If someone asks about a feature we don't have, acknowledge it honestly and mention we actively build based on customer feedback`;

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
