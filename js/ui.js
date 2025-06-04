/**
 * UI Manager for RAG Musache Frontend
 * Handles all user interface interactions and animations
 */

class UIManager {
    constructor() {
        this.currentStep = 'welcome';
        this.isUploading = false;
        this.isProcessing = false;
        this.notifications = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeAnimations();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Sections
        this.welcomeSection = document.getElementById('welcomeSection');
        this.uploadSection = document.getElementById('uploadSection');
        this.chatSection = document.getElementById('chatSection');
        this.historySection = document.getElementById('historySection');

        // Upload elements
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressStatus = document.getElementById('progressStatus');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');

        // Status elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');

        // Loading overlay
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');

        // Notification container
        this.notificationContainer = document.getElementById('notificationContainer');

        // Chat elements (will be handled by ChatManager)
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // File upload events
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop events
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        this.dropZone.addEventListener('click', () => this.fileInput.click());

        // Suggestion buttons
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = e.target.getAttribute('data-suggestion');
                if (suggestion && window.chat) {
                    window.chat.sendMessage(suggestion);
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window events
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
    }

    /**
     * Initialize animations and scroll effects
     */
    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animation
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            this.scrollObserver.observe(el);
        });
    }

    /**
     * Handle file selection
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    /**
     * Handle drag over
     */
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dropZone.classList.add('dragover');
    }

    /**
     * Handle drag leave
     */
    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dropZone.classList.remove('dragover');
    }

    /**
     * Handle file drop
     */
    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dropZone.classList.remove('dragover');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    /**
     * Process uploaded file
     */
    async processFile(file) {
        if (this.isUploading) {
            this.showNotification('Ya hay una subida en proceso', 'warning');
            return;
        }

        try {
            // Validate file
            window.api.validateFile(file);

            // Show file info
            this.fileName.textContent = file.name;
            this.fileSize.textContent = window.api.formatFileSize(file.size);

            // Show progress
            this.showUploadProgress();
            this.isUploading = true;

            // Upload file
            const response = await window.api.uploadDocument(file, (progress) => {
                this.updateProgress(progress, 'Subiendo archivo...');
            });

            // Success
            this.showNotification('Archivo subido correctamente', 'success');
            this.updateProgress(100, 'Procesando documento...');

            // Wait for processing
            await this.waitForProcessing();

        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(error.message, 'error');
            this.hideUploadProgress();
        } finally {
            this.isUploading = false;
        }
    }

    /**
     * Wait for document processing
     */
    async waitForProcessing() {
        this.isProcessing = true;
        this.updateProgress(100, 'Procesando documento...');

        try {
            const status = await window.api.waitForReady();
            
            // Success - show chat interface
            this.showNotification('Documento procesado correctamente', 'success');
            this.updateDocumentInfo(status);
            this.showChatInterface();
            this.hideUploadProgress();

        } catch (error) {
            console.error('Processing error:', error);
            this.showNotification('Error procesando el documento', 'error');
            this.hideUploadProgress();
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Show upload progress
     */
    showUploadProgress() {
        this.uploadProgress.classList.remove('hidden');
        this.uploadProgress.classList.add('fade-in');
    }

    /**
     * Hide upload progress
     */
    hideUploadProgress() {
        this.uploadProgress.classList.add('hidden');
        this.progressFill.style.width = '0%';
    }

    /**
     * Update progress bar
     */
    updateProgress(percentage, status) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressStatus.textContent = status;
    }

    /**
     * Show chat interface
     */
    showChatInterface() {
        // Hide welcome and show chat
        this.welcomeSection.classList.add('hidden');
        this.chatSection.classList.remove('hidden');
        this.chatSection.classList.add('fade-in');

        // Scroll to chat section
        this.chatSection.scrollIntoView({ behavior: 'smooth' });
        
        // Focus on input
        setTimeout(() => {
            this.messageInput.focus();
        }, 500);
    }

    /**
     * Update document info in chat header
     */
    updateDocumentInfo(status) {
        const documentName = this.fileName.textContent;
        const chunksCount = status.total_chunks;

        document.getElementById('documentName').textContent = `📄 ${documentName}`;
        document.getElementById('chunksCount').textContent = `📊 ${chunksCount} chunks procesados`;
    }

    /**
     * Update system status indicator
     */
    updateSystemStatus(status) {
        const dot = this.statusIndicator.querySelector('.status-dot');
        
        switch (status) {
            case 'connected':
                dot.classList.add('connected');
                this.statusText.textContent = 'Conectado';
                break;
            case 'ready':
                dot.classList.add('connected');
                this.statusText.textContent = 'Sistema listo';
                break;
            case 'processing':
                dot.classList.remove('connected');
                this.statusText.textContent = 'Procesando...';
                break;
            case 'error':
                dot.classList.remove('connected');
                this.statusText.textContent = 'Error de conexión';
                break;
            default:
                dot.classList.remove('connected');
                this.statusText.textContent = 'Conectando...';
        }
    }

    /**
     * Show loading overlay
     */
    showLoading(text = 'Cargando...') {
        this.loadingText.textContent = text;
        this.loadingOverlay.classList.remove('hidden');
        this.loadingOverlay.classList.add('fade-in');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        this.notificationContainer.appendChild(notification);
        this.notifications.push(notification);

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Click to remove
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });
    }

    /**
     * Remove notification
     */
    removeNotification(notification) {
        if (notification.parentNode) {
            notification.classList.add('removing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
            }, 300);
        }
    }

    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Escape key to close modals/overlays
        if (event.key === 'Escape') {
            this.hideLoading();
        }

        // Enter to send message (handled by ChatManager)
        if (event.key === 'Enter' && event.target === this.messageInput) {
            event.preventDefault();
            if (window.chat && !event.shiftKey) {
                window.chat.handleSendMessage();
            }
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        if (this.isUploading || this.isProcessing) {
            event.preventDefault();
            event.returnValue = '¿Estás seguro? Hay una operación en progreso.';
            return event.returnValue;
        }
    }

    /**
     * Smooth scroll to element
     */
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Add bounce animation to element
     */
    bounceElement(element) {
        element.classList.add('bounce');
        setTimeout(() => {
            element.classList.remove('bounce');
        }, 2000);
    }

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Format text with line breaks
     */
    formatText(text) {
        return text.replace(/\n/g, '<br>');
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Texto copiado al portapapeles', 'success', 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showNotification('Error al copiar texto', 'error');
        }
    }

    /**
     * Reset UI to initial state
     */
    reset() {
        // Hide all sections except welcome
        this.chatSection.classList.add('hidden');
        this.historySection.classList.add('hidden');
        this.welcomeSection.classList.remove('hidden');

        // Reset upload progress
        this.hideUploadProgress();

        // Clear file input
        this.fileInput.value = '';

        // Reset flags
        this.isUploading = false;
        this.isProcessing = false;
        this.currentStep = 'welcome';

        // Hide loading overlay
        this.hideLoading();

        // Clear notifications
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
        this.notifications = [];

        // Reset status
        this.updateSystemStatus('disconnected');
    }

    /**
     * Show error modal
     */
    showErrorModal(title, message, actions = []) {
        const modal = document.createElement('div');
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-actions">
                    ${actions.map(action => 
                        `<button class="modal-btn ${action.type}" onclick="${action.onclick}">${action.text}</button>`
                    ).join('')}
                    <button class="modal-btn secondary" onclick="this.closest('.error-modal').remove()">Cerrar</button>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        document.body.appendChild(modal);
        
        // Auto-remove on backdrop click
        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            modal.remove();
        });

        return modal;
    }

    /**
     * Show success animation
     */
    showSuccessAnimation(element) {
        element.classList.add('success-pulse');
        setTimeout(() => {
            element.classList.remove('success-pulse');
        }, 1000);
    }

    /**
     * Show loading on element
     */
    showElementLoading(element) {
        element.classList.add('loading');
        element.setAttribute('data-original-content', element.innerHTML);
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    /**
     * Hide loading on element
     */
    hideElementLoading(element) {
        element.classList.remove('loading');
        const originalContent = element.getAttribute('data-original-content');
        if (originalContent) {
            element.innerHTML = originalContent;
            element.removeAttribute('data-original-content');
        }
    }

    /**
     * Get theme preference
     */
    getTheme() {
        return localStorage.getItem('rag-theme') || 'dark';
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        localStorage.setItem('rag-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        this.showNotification(`Tema cambiado a ${theme}`, 'info', 2000);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Show welcome tour
     */
    showWelcomeTour() {
        const tourSteps = [
            {
                element: this.dropZone,
                title: 'Subir Documentos',
                description: 'Arrastra archivos PDF o TXT aquí para comenzar'
            },
            {
                element: this.statusIndicator,
                title: 'Estado del Sistema',
                description: 'Aquí puedes ver si el sistema está conectado y listo'
            },
            {
                element: this.chatSection,
                title: 'Chat Inteligente',
                description: 'Una vez subido el documento, podrás chatear sobre su contenido'
            }
        ];

        // Implementation of tour would go here
        console.log('Welcome tour:', tourSteps);
    }

    /**
     * Export logs for debugging
     */
    exportDebugLogs() {
        const logs = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            currentStep: this.currentStep,
            isUploading: this.isUploading,
            isProcessing: this.isProcessing,
            notifications: this.notifications.length,
            elements: {
                welcomeSection: !!this.welcomeSection,
                uploadSection: !!this.uploadSection,
                chatSection: !!this.chatSection,
                dropZone: !!this.dropZone
            },
            errors: this.getErrorLogs()
        };

        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `rag-debug-${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Debug logs exportados', 'success');
    }

    /**
     * Get error logs
     */
    getErrorLogs() {
        return window.errorLogs || [];
    }

    /**
     * Add error to logs
     */
    addErrorLog(error, context = '') {
        if (!window.errorLogs) {
            window.errorLogs = [];
        }

        window.errorLogs.push({
            timestamp: new Date().toISOString(),
            error: error.toString(),
            stack: error.stack,
            context: context
        });

        // Keep only last 50 errors
        if (window.errorLogs.length > 50) {
            window.errorLogs = window.errorLogs.slice(-50);
        }
    }
}

// Initialize UI manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UIManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}