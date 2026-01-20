const express = require('express');
const router = express.Router();

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res) => {
    try {
        const { email, name, transcript, pageUrl, conversationId } = req.body;

        // Validate email
        if (!email || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Valid email address required' });
        }

        // Format transcript for email
        const formattedTranscript = transcript
            .map(msg => `[${msg.role === 'user' ? 'Visitor' : 'ShadowTrace AI'}]: ${msg.content}`)
            .join('\n\n');

        // Build email content
        const emailContent = {
            to: process.env.LEAD_EMAIL || 'sales@shadowtrace.ai',
            subject: `New Chat Lead: ${email}`,
            body: `
=== NEW LEAD FROM WEBSITE CHATBOT ===

Email: ${email}
Name: ${name || 'Not provided'}
Timestamp: ${new Date().toISOString()}
Page: ${pageUrl || 'Unknown'}
Conversation ID: ${conversationId || 'Unknown'}

=== CONVERSATION TRANSCRIPT ===

${formattedTranscript}

---
This lead was captured from the ShadowTrace website chatbot.
            `.trim()
        };

        // Option 1: Use EmailJS (requires client-side setup)
        // Option 2: Use a service like Resend, SendGrid, or Mailgun
        // For now, we'll use a webhook approach that can be configured

        if (process.env.LEAD_WEBHOOK_URL) {
            // Send to webhook (e.g., Zapier, Make, or custom endpoint)
            const webhookResponse = await fetch(process.env.LEAD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: name || '',
                    transcript: formattedTranscript,
                    pageUrl,
                    conversationId,
                    timestamp: new Date().toISOString()
                })
            });

            if (!webhookResponse.ok) {
                throw new Error('Webhook delivery failed');
            }
        }

        // Log for debugging (remove in production or use proper logging)
        console.log('Lead captured:', {
            email,
            name,
            conversationId,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Thank you! We\'ll be in touch soon.'
        });

    } catch (error) {
        console.error('Lead capture error:', error);
        res.status(500).json({
            error: 'Failed to submit. Please try again or contact us directly.'
        });
    }
});

module.exports = router;
