/**
 * API Client for RAG Musache
 * Handles all communication with the backend API
 */

class APIClient {
    constructor() {
        // Use the deployed API URL
        this.baseURL = 'https://rag-musache.onrender.com/api/v1';
        this.timeout = 30000; // 30 seconds timeout
    }

    /**
     * Make HTTP request with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: this.timeout,
        };

        const config = { ...defaultOptions, ...options };

        try {
            console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ API Response:`, data);
            return data;

        } catch (error) {
            console.error(`❌ API Error:`, error);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - the server is taking too long to respond');
            }
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to the server. Please check your internet connection.');
            }
            
            throw error;
        }
    }

    /**
     * Check system health
     */
    async checkHealth() {
        return await this.request('/health');
    }

    /**
     * Get system status
     */
    async getStatus() {
        return await this.request('/status');
    }

    /**
     * Upload document
     */
    async uploadDocument(file, onProgress = null) {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseURL}/upload-document`;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        onProgress(percentComplete);
                    }
                });
            }

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        console.log('✅ Upload successful:', response);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('Invalid response format'));
                    }
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        reject(new Error(errorData.detail || `Upload failed: ${xhr.status}`));
                    } catch {
                        reject(new Error(`Upload failed: ${xhr.status}`));
                    }
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('timeout', () => {
                reject(new Error('Upload timeout'));
            });

            xhr.timeout = this.timeout;
            xhr.open('POST', url);
            xhr.send(formData);
        });
    }

    /**
     * Ask question
     */
    async askQuestion(question) {
        return await this.request('/ask', {
            method: 'POST',
            body: JSON.stringify({ question })
        });
    }

    /**
     * Get conversation history
     */
    async getHistory(limit = 10) {
        return await this.request(`/history?limit=${limit}`);
    }

    /**
     * Get debug information
     */
    async getDebugInfo() {
        return await this.request('/debug');
    }

    /**
     * Poll status until ready
     */
    async waitForReady(maxAttempts = 20, interval = 3000) {
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                const status = await this.getStatus();
                
                if (status.status === 'ready') {
                    return status;
                }
                
                console.log(`⏳ System not ready yet (${status.status}), waiting...`);
                await this.sleep(interval);
                attempts++;
                
            } catch (error) {
                console.error('Error checking status:', error);
                attempts++;
                await this.sleep(interval);
            }
        }
        
        throw new Error('System did not become ready within the expected time');
    }

    /**
     * Utility: Sleep function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Validate file before upload
     */
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['text/plain', 'application/pdf'];
        const allowedExtensions = ['.txt', '.pdf'];

        // Check file size
        if (file.size > maxSize) {
            throw new Error('File size must be less than 10MB');
        }

        // Check file type
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (!allowedExtensions.includes(fileExtension)) {
            throw new Error('Only PDF and TXT files are allowed');
        }

        // Additional MIME type check
        if (!allowedTypes.includes(file.type) && file.type !== '') {
            console.warn('MIME type check failed, but proceeding based on extension');
        }

        return true;
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Format timestamp
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Format response text with basic markdown support
     */
    formatResponseText(text) {
        // Basic markdown formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
}

// Create global API client instance
window.api = new APIClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}