/**
 * Chat Manager for RAG Musache Frontend
 * Handles all chat functionality and messaging
 */

class ChatManager {
    constructor() {
        this.messages = [];
        this.isProcessing = false;
        this.messageId = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadHistory();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.suggestionButtons = document.querySelectorAll('.suggestion-btn');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Send button
        this.sendButton.addEventListener('click', () => this.handleSendMessage());

        // Enter key in input
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Input changes
        this.messageInput.addEventListener('input', () => this.handleInputChange());

        // Suggestion buttons
        this.suggestionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = e.target.getAttribute('data-suggestion');
                if (suggestion) {
                    this.sendMessage(suggestion);
                }
            });
        });
    }

    /**
     * Handle send message
     */
    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (message && !this.isProcessing) {
            await this.sendMessage(message);
        }
    }

    /**
     * Send message
     */
    async sendMessage(messageText) {
        if (this.isProcessing) {
            window.ui.showNotification('Espera a que termine la respuesta anterior', 'warning');
            return;
        }

        // Clear input
        this.messageInput.value = '';
        this.updateSendButton();

        // Add user message
        const userMessage = this.addMessage(messageText, 'user');
        
        // Show typing indicator
        const typingMessage = this.addTypingIndicator();

        try {
            this.isProcessing = true;
            this.updateSendButton();

            // Send to API
            const response = await window.api.askQuestion(messageText);

            // Remove typing indicator
            this.removeMessage(typingMessage);

            // Add assistant response
            this.addMessage(response.answer, 'assistant', {
                contextChunks: response.context_chunks,
                responseTime: response.response_time,
                timestamp: response.timestamp
            });

            // Store in local messages
            this.messages.push({
                id: this.messageId++,
                question: messageText,
                answer: response.answer,
                timestamp: new Date(),
                contextChunks: response.context_chunks,
                responseTime: response.response_time
            });

        } catch (error) {
            console.error('Chat error:', error);
            
            // Remove typing indicator
            this.removeMessage(typingMessage);
            
            // Add error message
            this.addMessage(
                `Lo siento, ha ocurrido un error: ${error.message}`, 
                'error'
            );

            window.ui.showNotification(error.message, 'error');

        } finally {
            this.isProcessing = false;
            this.updateSendButton();
            this.messageInput.focus();
        }
    }

    /**
     * Add message to chat
     */
    addMessage(content, type, metadata = {}) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        messageElement.id = messageId;

        // Message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        if (type === 'user') {
            messageContent.innerHTML = `
                <i class="fas fa-user"></i>
                <p>${window.api.sanitizeHTML(content)}</p>
            `;
        } else if (type === 'assistant') {
            const formattedContent = window.api.formatResponseText(content);
            messageContent.innerHTML = `
                <div class="assistant-response">
                    <i class="fas fa-robot"></i>
                    <div class="response-content">
                        <p>${formattedContent}</p>
                    </div>
                </div>
            `;
        } else if (type === 'error') {
            messageContent.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <p>${window.api.sanitizeHTML(content)}</p>
            `;
            messageElement.classList.add('error-message');
        } else if (type === 'system') {
            messageContent.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <p>${window.api.sanitizeHTML(content)}</p>
            `;
        }

        messageElement.appendChild(messageContent);

        // Add to container
        this.messagesContainer.appendChild(messageElement);

        // Animate in
        messageElement.classList.add('fade-in');

        // Scroll to bottom
        this.scrollToBottom();

        return messageElement;
    }

    /**
     * Add typing indicator
     */
    addTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message assistant typing';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'message-content';
        typingContent.innerHTML = `
            <i class="fas fa-robot"></i>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        typingElement.appendChild(typingContent);
        this.messagesContainer.appendChild(typingElement);

        this.scrollToBottom();
        return typingElement;
    }

    /**
     * Remove message
     */
    removeMessage(messageElement) {
        if (messageElement && messageElement.parentNode) {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }
    }

    /**
     * Handle input change
     */
    handleInputChange() {
        this.updateSendButton();
    }

    /**
     * Update send button state
     */
    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        const canSend = hasText && !this.isProcessing;

        this.sendButton.disabled = !canSend;
        
        if (this.isProcessing) {
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    /**
     * Load conversation history
     */
    async loadHistory() {
        try {
            const history = await window.api.getHistory(5);
            
            if (history && history.length > 0) {
                // Add history separator
                this.addMessage('— Conversaciones anteriores —', 'system');
                
                // Add recent conversations
                history.reverse().forEach(item => {
                    this.addMessage(item.question, 'user');
                    this.addMessage(item.answer, 'assistant');
                });

                // Add current session separator
                this.addMessage('— Nueva sesión —', 'system');
            }

        } catch (error) {
            console.log('No previous history available');
        }
    }

    /**
     * Clear chat
     */
    clearChat() {
        // Keep only the initial system message
        const systemMessage = this.messagesContainer.querySelector('.system-message');
        this.messagesContainer.innerHTML = '';
        
        if (systemMessage) {
            this.messagesContainer.appendChild(systemMessage);
        }

        this.messages = [];
        this.messageId = 0;
    }

    /**
     * Export conversation
     */
    exportConversation() {
        if (this.messages.length === 0) {
            window.ui.showNotification('No hay conversación para exportar', 'warning');
            return;
        }

        const conversation = this.messages.map(msg => ({
            timestamp: msg.timestamp.toISOString(),
            question: msg.question,
            answer: msg.answer,
            responseTime: msg.responseTime
        }));

        const dataStr = JSON.stringify(conversation, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `rag-conversation-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        window.ui.showNotification('Conversación exportada', 'success');
    }

    /**
     * Get conversation summary
     */
    getConversationSummary() {
        return {
            totalMessages: this.messages.length,
            totalQuestions: this.messages.length,
            averageResponseTime: this.messages.reduce((avg, msg) => {
                const time = parseFloat(msg.responseTime.replace('s', ''));
                return avg + time;
            }, 0) / this.messages.length,
            firstMessage: this.messages[0]?.timestamp,
            lastMessage: this.messages[this.messages.length - 1]?.timestamp
        };
    }

    /**
     * Search in conversation
     */
    searchConversation(query) {
        const results = this.messages.filter(msg => 
            msg.question.toLowerCase().includes(query.toLowerCase()) ||
            msg.answer.toLowerCase().includes(query.toLowerCase())
        );

        return results;
    }

    /**
     * Add quick action buttons to messages
     */
    addQuickActions(messageElement, content, type) {
        if (type !== 'assistant') return;

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'message-actions';
        actionsContainer.innerHTML = `
            <button class="action-btn" onclick="window.chat.copyMessage('${content}')">
                <i class="fas fa-copy"></i>
            </button>
            <button class="action-btn" onclick="window.chat.regenerateResponse('${content}')">
                <i class="fas fa-redo"></i>
            </button>
        `;

        messageElement.appendChild(actionsContainer);
    }

    /**
     * Copy message content
     */
    async copyMessage(content) {
        await window.ui.copyToClipboard(content);
    }

    /**
     * Regenerate response
     */
    async regenerateResponse(originalQuestion) {
        await this.sendMessage(originalQuestion);
    }

    /**
     * Handle message feedback
     */
    handleMessageFeedback(messageId, rating) {
        console.log(`Message ${messageId} rated: ${rating}`);
        window.ui.showNotification('¡Gracias por tu feedback!', 'success', 2000);
    }
}

// Initialize chat manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chat = new ChatManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatManager;
}