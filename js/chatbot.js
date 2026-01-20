/**
 * ShadowTrace Chatbot Widget
 * A conversational AI assistant for the ShadowTrace website
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        apiUrl: '', // Same-origin API (relative URLs)
        storageKey: 'shadowtrace_chat',
        leadCaptureThreshold: 4, // Show lead capture after this many exchanges
        maxStoredMessages: 50
    };

    // State
    let state = {
        isOpen: false,
        messages: [],
        isLoading: false,
        leadCaptureShown: false,
        leadSubmitted: false,
        conversationId: null
    };

    // Generate unique conversation ID
    function generateId() {
        return 'chat_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Load conversation from localStorage
    function loadConversation() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                state.messages = data.messages || [];
                state.conversationId = data.conversationId || generateId();
                state.leadCaptureShown = data.leadCaptureShown || false;
                state.leadSubmitted = data.leadSubmitted || false;
            } else {
                state.conversationId = generateId();
            }
        } catch (e) {
            console.error('Failed to load chat history:', e);
            state.conversationId = generateId();
        }
    }

    // Save conversation to localStorage
    function saveConversation() {
        try {
            const data = {
                messages: state.messages.slice(-CONFIG.maxStoredMessages),
                conversationId: state.conversationId,
                leadCaptureShown: state.leadCaptureShown,
                leadSubmitted: state.leadSubmitted
            };
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save chat history:', e);
        }
    }

    // Create chat widget HTML
    function createWidget() {
        const widget = document.createElement('div');
        widget.id = 'st-chat-widget';
        widget.innerHTML = `
            <style>
                #st-chat-widget {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 9999;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                #st-chat-bubble {
                    width: 56px;
                    height: 56px;
                    border-radius: 9999px;
                    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 0 30px -5px rgba(168, 85, 247, 0.4);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                #st-chat-bubble:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 40px -5px rgba(168, 85, 247, 0.6);
                }

                #st-chat-bubble svg {
                    width: 24px;
                    height: 24px;
                    fill: white;
                    transition: transform 0.3s ease;
                }

                #st-chat-bubble.open svg {
                    transform: rotate(90deg);
                }

                #st-chat-window {
                    position: absolute;
                    bottom: 70px;
                    right: 0;
                    width: 380px;
                    max-width: calc(100vw - 48px);
                    height: 540px;
                    max-height: calc(100vh - 120px);
                    background: rgba(10, 10, 15, 0.98);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                #st-chat-window.open {
                    display: flex;
                    animation: st-slide-up 0.3s ease;
                }

                @keyframes st-slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                #st-chat-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                #st-chat-header-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                #st-chat-header-avatar svg {
                    width: 20px;
                    height: 20px;
                    fill: white;
                }

                #st-chat-header-info {
                    flex: 1;
                }

                #st-chat-header-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: white;
                    margin: 0;
                }

                #st-chat-header-subtitle {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 2px 0 0 0;
                }

                #st-chat-close {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }

                #st-chat-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                #st-chat-close svg {
                    width: 14px;
                    height: 14px;
                    stroke: rgba(255, 255, 255, 0.6);
                }

                #st-chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                #st-chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                #st-chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }

                #st-chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }

                .st-message {
                    max-width: 85%;
                    padding: 12px 16px;
                    font-size: 13px;
                    line-height: 1.5;
                    color: rgba(255, 255, 255, 0.9);
                    word-wrap: break-word;
                }

                .st-message-user {
                    align-self: flex-end;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                    border-radius: 16px 16px 4px 16px;
                }

                .st-message-assistant {
                    align-self: flex-start;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px 16px 16px 4px;
                }

                .st-message-assistant strong {
                    color: white;
                }

                .st-typing {
                    display: flex;
                    gap: 4px;
                    padding: 16px;
                }

                .st-typing-dot {
                    width: 8px;
                    height: 8px;
                    background: rgba(168, 85, 247, 0.6);
                    border-radius: 50%;
                    animation: st-typing 1.4s infinite ease-in-out;
                }

                .st-typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .st-typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes st-typing {
                    0%, 80%, 100% {
                        transform: scale(0.6);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                #st-chat-input-area {
                    padding: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                #st-chat-input-wrapper {
                    display: flex;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 4px 4px 4px 16px;
                }

                #st-chat-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: white;
                    font-size: 13px;
                    font-family: inherit;
                    resize: none;
                    min-height: 20px;
                    max-height: 100px;
                }

                #st-chat-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                #st-chat-send {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.2s, transform 0.2s;
                }

                #st-chat-send:hover {
                    transform: scale(1.05);
                }

                #st-chat-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                #st-chat-send svg {
                    width: 16px;
                    height: 16px;
                    fill: white;
                }

                #st-lead-capture {
                    padding: 16px;
                    background: rgba(168, 85, 247, 0.05);
                    border-top: 1px solid rgba(168, 85, 247, 0.1);
                    display: none;
                }

                #st-lead-capture.show {
                    display: block;
                    animation: st-slide-up 0.3s ease;
                }

                #st-lead-capture h4 {
                    font-size: 13px;
                    font-weight: 500;
                    color: white;
                    margin: 0 0 8px 0;
                }

                #st-lead-capture p {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0 0 12px 0;
                    line-height: 1.5;
                }

                .st-lead-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    font-family: inherit;
                    margin-bottom: 8px;
                    box-sizing: border-box;
                }

                .st-lead-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .st-lead-input:focus {
                    outline: none;
                    border-color: rgba(168, 85, 247, 0.5);
                }

                .st-lead-buttons {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }

                .st-lead-btn {
                    flex: 1;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .st-lead-btn-primary {
                    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
                    border: none;
                    color: white;
                }

                .st-lead-btn-primary:hover {
                    opacity: 0.9;
                }

                .st-lead-btn-secondary {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.6);
                }

                .st-lead-btn-secondary:hover {
                    border-color: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .st-welcome {
                    text-align: center;
                    padding: 20px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                }

                .st-welcome-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 12px;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .st-welcome-icon svg {
                    width: 24px;
                    height: 24px;
                    fill: #a855f7;
                }

                @media (max-width: 480px) {
                    #st-chat-window {
                        position: fixed;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        max-width: 100%;
                        max-height: 100%;
                        border-radius: 0;
                        bottom: 0;
                    }

                    #st-chat-bubble.open {
                        display: none;
                    }
                }
            </style>

            <div id="st-chat-bubble" role="button" aria-label="Open chat" tabindex="0">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
            </div>

            <div id="st-chat-window">
                <div id="st-chat-header">
                    <div id="st-chat-header-avatar">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                    </div>
                    <div id="st-chat-header-info">
                        <h3 id="st-chat-header-title">ShadowTrace</h3>
                        <p id="st-chat-header-subtitle">AI Assistant</p>
                    </div>
                    <button id="st-chat-close" aria-label="Close chat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div id="st-chat-messages"></div>

                <div id="st-lead-capture">
                    <h4>Would you like us to follow up?</h4>
                    <p>I can send this conversation to your email, or have someone reach out.</p>
                    <input type="email" class="st-lead-input" id="st-lead-email" placeholder="Your email">
                    <input type="text" class="st-lead-input" id="st-lead-name" placeholder="Your name (optional)">
                    <div class="st-lead-buttons">
                        <button class="st-lead-btn st-lead-btn-secondary" id="st-lead-skip">No thanks</button>
                        <button class="st-lead-btn st-lead-btn-primary" id="st-lead-submit">Send to me</button>
                    </div>
                </div>

                <div id="st-chat-input-area">
                    <div id="st-chat-input-wrapper">
                        <textarea id="st-chat-input" placeholder="Ask about ShadowTrace..." rows="1"></textarea>
                        <button id="st-chat-send" aria-label="Send message">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        return widget;
    }

    // Render messages
    function renderMessages() {
        const container = document.getElementById('st-chat-messages');
        if (!container) return;

        if (state.messages.length === 0) {
            container.innerHTML = `
                <div class="st-welcome">
                    <div class="st-welcome-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        </svg>
                    </div>
                    <p>Hi! I'm the ShadowTrace AI assistant. Ask me anything about our blockchain intelligence platform.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = state.messages
            .map(msg => `
                <div class="st-message st-message-${msg.role}">
                    ${escapeHtml(msg.content)}
                </div>
            `)
            .join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    // Show typing indicator
    function showTyping() {
        const container = document.getElementById('st-chat-messages');
        if (!container) return;

        const typingEl = document.createElement('div');
        typingEl.id = 'st-typing-indicator';
        typingEl.className = 'st-message st-message-assistant st-typing';
        typingEl.innerHTML = `
            <div class="st-typing-dot"></div>
            <div class="st-typing-dot"></div>
            <div class="st-typing-dot"></div>
        `;
        container.appendChild(typingEl);
        container.scrollTop = container.scrollHeight;
    }

    // Hide typing indicator
    function hideTyping() {
        const typingEl = document.getElementById('st-typing-indicator');
        if (typingEl) typingEl.remove();
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    // Send message to API
    async function sendMessage(userMessage) {
        if (state.isLoading || !userMessage.trim()) return;

        state.isLoading = true;
        state.messages.push({ role: 'user', content: userMessage.trim() });
        renderMessages();
        showTyping();

        const sendBtn = document.getElementById('st-chat-send');
        if (sendBtn) sendBtn.disabled = true;

        try {
            const response = await fetch(`${CONFIG.apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: state.messages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            state.messages.push({ role: 'assistant', content: data.reply });
            saveConversation();

            // Check if should show lead capture
            checkLeadCapture();

        } catch (error) {
            console.error('Chat error:', error);
            state.messages.push({
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again or contact us directly at sales@shadowtrace.ai.'
            });
        } finally {
            state.isLoading = false;
            hideTyping();
            renderMessages();
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    // Check if should show lead capture
    function checkLeadCapture() {
        if (state.leadCaptureShown || state.leadSubmitted) return;

        const userMessages = state.messages.filter(m => m.role === 'user').length;
        if (userMessages >= CONFIG.leadCaptureThreshold) {
            showLeadCapture();
        }
    }

    // Show lead capture form
    function showLeadCapture() {
        state.leadCaptureShown = true;
        saveConversation();
        const leadCapture = document.getElementById('st-lead-capture');
        if (leadCapture) leadCapture.classList.add('show');
    }

    // Hide lead capture form
    function hideLeadCapture() {
        const leadCapture = document.getElementById('st-lead-capture');
        if (leadCapture) leadCapture.classList.remove('show');
    }

    // Submit lead
    async function submitLead() {
        const emailInput = document.getElementById('st-lead-email');
        const nameInput = document.getElementById('st-lead-name');
        const email = emailInput?.value?.trim();
        const name = nameInput?.value?.trim();

        if (!email || !email.includes('@')) {
            emailInput?.focus();
            return;
        }

        try {
            await fetch(`${CONFIG.apiUrl}/api/lead`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name,
                    transcript: state.messages,
                    pageUrl: window.location.href,
                    conversationId: state.conversationId
                })
            });

            state.leadSubmitted = true;
            saveConversation();
            hideLeadCapture();

            // Add confirmation message
            state.messages.push({
                role: 'assistant',
                content: `Thanks${name ? ', ' + name : ''}! I've noted your email (${email}). Someone from our team will be in touch soon.`
            });
            renderMessages();

        } catch (error) {
            console.error('Lead submission error:', error);
            state.messages.push({
                role: 'assistant',
                content: 'Sorry, there was an error. You can reach us directly at sales@shadowtrace.ai.'
            });
            renderMessages();
        }
    }

    // Toggle chat window
    function toggleChat() {
        state.isOpen = !state.isOpen;
        const bubble = document.getElementById('st-chat-bubble');
        const window = document.getElementById('st-chat-window');

        if (bubble) bubble.classList.toggle('open', state.isOpen);
        if (window) window.classList.toggle('open', state.isOpen);

        if (state.isOpen) {
            renderMessages();
            const input = document.getElementById('st-chat-input');
            if (input) setTimeout(() => input.focus(), 100);
        }
    }

    // Initialize widget
    function init() {
        loadConversation();
        const widget = createWidget();

        // Event listeners
        const bubble = document.getElementById('st-chat-bubble');
        const closeBtn = document.getElementById('st-chat-close');
        const sendBtn = document.getElementById('st-chat-send');
        const input = document.getElementById('st-chat-input');
        const leadSkip = document.getElementById('st-lead-skip');
        const leadSubmit = document.getElementById('st-lead-submit');

        bubble?.addEventListener('click', toggleChat);
        bubble?.addEventListener('keypress', e => e.key === 'Enter' && toggleChat());
        closeBtn?.addEventListener('click', toggleChat);

        sendBtn?.addEventListener('click', () => {
            const message = input?.value;
            if (input) input.value = '';
            sendMessage(message);
        });

        input?.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = input.value;
                input.value = '';
                sendMessage(message);
            }
        });

        // Auto-resize textarea
        input?.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        });

        leadSkip?.addEventListener('click', hideLeadCapture);
        leadSubmit?.addEventListener('click', submitLead);

        // Keyboard escape to close
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && state.isOpen) {
                toggleChat();
            }
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
