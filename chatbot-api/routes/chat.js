const express = require('express');
const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('../config/prompt');

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window

function checkRateLimit(ip) {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false;
    }

    record.count++;
    return true;
}

router.post('/', async (req, res) => {
    try {
        // Rate limiting
        const clientIp = req.ip || req.connection.remoteAddress;
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({
                error: 'Too many requests. Please wait a moment before trying again.'
            });
        }

        const { messages } = req.body;

        // Validate input
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request: messages array required' });
        }

        // Limit message history to prevent token overflow
        const recentMessages = messages.slice(-10);

        // Build full message array with system prompt
        const fullMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...recentMessages
        ];

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: fullMessages,
            max_tokens: 500,
            temperature: 0.7,
        });

        const assistantMessage = completion.choices[0]?.message?.content;

        if (!assistantMessage) {
            throw new Error('No response from OpenAI');
        }

        res.json({
            message: assistantMessage,
            usage: completion.usage
        });

    } catch (error) {
        console.error('Chat API error:', error);

        if (error.status === 429) {
            return res.status(429).json({
                error: 'Service is busy. Please try again in a moment.'
            });
        }

        res.status(500).json({
            error: 'Sorry, I encountered an error. Please try again.'
        });
    }
});

module.exports = router;
