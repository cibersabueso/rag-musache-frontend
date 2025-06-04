/**
 * Main Application Controller for RAG Musache Frontend
 * Coordinates all components and handles application lifecycle
 */

class RAGMusacheApp {
    constructor() {
        this.isInitialized = false;
        this.systemStatus = 'disconnected';
        this.checkInterval = null;
        
        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        console.log('🚀 Initializing RAG Musache Frontend...');

        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }

        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize all components
     */
    async initializeComponents() {
        console.log('🔧 Initializing components...');

        try {
            // Initialize UI Manager
            window.ui = new UIManager();
            console.log('✅ UI Manager initialized');

            // Initialize Chat Manager (will be initialized after DOM is ready)
            // window.chat is initialized in chat.js

            // Check system health
            await this.checkSystemHealth();

            // Start periodic health checks
            this.startHealthChecks();

            // Setup global error handlers
            this.setupErrorHandlers();

            // Show welcome message
            this.showWelcomeMessage();

            // Mark as initialized
            this.isInitialized = true;
            console.log('✅ RAG Musache Frontend initialized successfully');

        } catch (error) {
            console.error('❌ Component initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Check system health
     */
    async checkSystemHealth() {
        try {
            console.log('🔍 Checking system health...');
            
            // Check API health
            const health = await window.api.checkHealth();
            console.log('Health check result:', health);

            // Check system status
            const status = await window.api.getStatus();
            console.log('System status:', status);

            // Update UI
            this.updateSystemStatus(status);

            return { health, status };

        } catch (error) {
            console.error('❌ Health check failed:', error);
            window.ui.updateSystemStatus('error');
            
            // Show user-friendly error
            window.ui.showNotification(
                'No se puede conectar al servidor. Verifica tu conexión.',
                'error',
                10000
            );

            throw error;
        }
    }

    /**
     * Update system status
     */
    updateSystemStatus(status) {
        this.systemStatus = status.status;

        // Update UI status indicator
        if (status.status === 'ready') {
            window.ui.updateSystemStatus('ready');
        } else if (status.status === 'not_ready') {
            window.ui.updateSystemStatus('connected');
        } else {
            window.ui.updateSystemStatus('error');
        }

        // Log status details
        console.log(`📊 System Status: ${status.status}, Chunks: ${status.total_chunks}`);
    }

    /**
     * Start periodic health checks
     */
    startHealthChecks() {
        // Check every 30 seconds
        this.checkInterval = setInterval(async () => {
            try {
                await this.checkSystemHealth();
            } catch (error) {
                console.log('Periodic health check failed (this is normal if server is sleeping)');
            }
        }, 30000);
    }

    /**
     * Stop health checks
     */
    stopHealthChecks() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Setup global error handlers
     */
    setupErrorHandlers() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            // Don't show notification for network errors during health checks
            if (!event.reason.message?.includes('Failed to fetch')) {
                window.ui.showNotification(
                    'Ha ocurrido un error inesperado',
                    'error'
                );
            }
            
            event.preventDefault();
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            
            window.ui.showNotification(
                'Error en la aplicación. Recarga la página si persiste.',
                'error'
            );
        });

        // Handle network errors
        window.addEventListener('offline', () => {
            window.ui.showNotification(
                'Sin conexión a internet',
                'warning',
                0 // Don't auto-hide
            );
            window.ui.updateSystemStatus('error');
        });

        window.addEventListener('online', () => {
            window.ui.showNotification(
                'Conexión restaurada',
                'success'
            );
            this.checkSystemHealth();
        });
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        // Add some personality to the app
        const messages = [
            '¡Bienvenido a RAG Musache! 🚀',
            'Sistema de IA listo para ayudarte 🤖',
            'Sube un documento y comienza a chatear 📄'
        ];

        // Show random welcome message
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        setTimeout(() => {
            window.ui.showNotification(randomMessage, 'info', 4000);
        }, 1000);
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('💥 Critical initialization error:', error);

        // Create fallback error UI
        const errorContainer = document.createElement('div');
        errorContainer.className = 'critical-error';
        errorContainer.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Error de Inicialización</h2>
                <p>No se pudo inicializar la aplicación correctamente.</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <button onclick="window.location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;

        // Add critical error styles
        errorContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;

        document.body.appendChild(errorContainer);
    }

    /**
     * Get application info
     */
    getAppInfo() {
        return {
            name: 'RAG Musache Frontend',
            version: '1.0.0',
            initialized: this.isInitialized,
            systemStatus: this.systemStatus,
            apiBaseUrl: window.api.baseURL,
            components: {
                ui: !!window.ui,
                chat: !!window.chat,
                api: !!window.api
            }
        };
    }

    /**
     * Debug mode toggle
     */
    toggleDebugMode() {
        if (window.DEBUG_MODE) {
            window.DEBUG_MODE = false;
            console.log('🔧 Debug mode disabled');
            window.ui.showNotification('Debug mode disabled', 'info');
        } else {
            window.DEBUG_MODE = true;
            console.log('🔧 Debug mode enabled');
            window.ui.showNotification('Debug mode enabled', 'info');
            
            // Add debug panel
            this.showDebugPanel();
        }
    }

    /**
     * Show debug panel
     */
    showDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.className = 'debug-panel';
        debugPanel.innerHTML = `
            <div class="debug-header">
                <h3>🔧 Debug Panel</h3>
                <button onclick="document.getElementById('debugPanel').remove()">×</button>
            </div>
            <div class="debug-content">
                <h4>Application Info</h4>
                <pre>${JSON.stringify(this.getAppInfo(), null, 2)}</pre>
                
                <h4>Actions</h4>
                <button onclick="window.app.checkSystemHealth()">Check Health</button>
                <button onclick="window.api.getDebugInfo().then(d => console.log(d))">API Debug</button>
                <button onclick="window.chat.clearChat()">Clear Chat</button>
                <button onclick="window.ui.reset()">Reset UI</button>
            </div>
        `;

        // Add debug styles
        debugPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            border-radius: 10px;
            z-index: 1000;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
        `;

        document.body.appendChild(debugPanel);
    }

    /**
     * Restart application
     */
    restart() {
        console.log('🔄 Restarting application...');
        
        // Stop health checks
        this.stopHealthChecks();
        
        // Reset components
        if (window.ui) {
            window.ui.reset();
        }
        
        if (window.chat) {
            window.chat.clearChat();
        }

        // Reinitialize
        this.isInitialized = false;
        this.init();
    }

    /**
     * Cleanup before page unload
     */
    cleanup() {
        console.log('🧹 Cleaning up application...');
        
        this.stopHealthChecks();
        
        // Additional cleanup as needed
    }
}

// Initialize application when script loads
console.log('🎬 Starting RAG Musache Frontend...');

// Global app instance
window.app = new RAGMusacheApp();

// Keyboard shortcuts for developers
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+D for debug mode
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.app.toggleDebugMode();
    }
    
    // Ctrl+Shift+R for restart
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        window.app.restart();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    window.app.cleanup();
});

// Make app info available globally for debugging
window.getAppInfo = () => window.app.getAppInfo();

console.log('✅ Main application script loaded');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAGMusacheApp;
}