class UIManager {
    constructor() {
        this.isMobile = false;
        this.notifications = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeMobileControls();
    }
    
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768) ||
               ('ontouchstart' in window);
    }
    
    setupEventListeners() {
        // Story log toggle
        const toggleLogBtn = document.getElementById('toggle-log');
        if (toggleLogBtn) {
            toggleLogBtn.addEventListener('click', this.toggleStoryLog.bind(this));
        }
        
        // Story log updates
        window.addEventListener('story-log-update', (event) => {
            this.addLogEntry(event.detail);
        });
    }
    
    initializeMobileControls() {
        try {
            if (this.isMobileDevice()) {
                import('nipplejs').then(nipplejs => {
                    try {
                        if (nipplejs && nipplejs.default && typeof nipplejs.default.create === 'function') {
                            this.setupMobileJoystick(nipplejs.default);
                        } else {
                            console.warn('nipplejs loaded but nipplejs.default.create is not a function');
                            this.hideMobileControls();
                        }
                    } catch (error) {
                        console.warn('Error setting up mobile joystick:', error);
                        this.hideMobileControls();
                    }
                }).catch(error => {
                    console.warn('Failed to load nipplejs library:', error);
                    this.hideMobileControls();
                });
            }
        } catch (error) {
            console.warn('Error initializing mobile controls:', error);
            this.hideMobileControls();
        }
    }
    
    setupMobileJoystick(nipplejs) {
        const joystickElement = document.getElementById('movement-joystick');
        if (!joystickElement) return;
        
        const manager = nipplejs.create({
            zone: joystickElement,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'rgba(255, 255, 255, 0.5)',
            size: 100
        });
        
        manager.on('move', (evt, data) => {
            window.dispatchEvent(new CustomEvent('mobile-move', {
                detail: {
                    angle: data.angle.degree,
                    force: data.force
                }
            }));
        });
        
        manager.on('end', () => {
            window.dispatchEvent(new CustomEvent('mobile-stop'));
        });
        
        // Mobile buttons
        const interactBtn = document.getElementById('mobile-interact');
        const nextBtn = document.getElementById('mobile-next');
        
        if (interactBtn) {
            interactBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('mobile-interact'));
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('mobile-next'));
            });
        }
    }
    
    toggleStoryLog() {
        const logContent = document.getElementById('log-content');
        const toggleBtn = document.getElementById('toggle-log');
        
        if (logContent && toggleBtn) {
            if (logContent.style.display === 'none') {
                logContent.style.display = 'block';
                toggleBtn.textContent = '−';
            } else {
                logContent.style.display = 'none';
                toggleBtn.textContent = '+';
            }
        }
    }
    
    addLogEntry(logEntry) {
        const logContent = document.getElementById('log-content');
        if (!logContent) return;
        
        const entryElement = document.createElement('div');
        entryElement.className = `log-entry ${logEntry.type}`;
        if (logEntry.type === 'observer_insight') {
          entryElement.classList.add('insight-text');
          entryElement.style.fontStyle = 'italic';
          entryElement.style.color = '#aabbff'; // Example color for insights
        }
        entryElement.textContent = logEntry.content;
        
        logContent.appendChild(entryElement);
        logContent.scrollTop = logContent.scrollHeight;
        
        // Keep only last 50 entries
        while (logContent.children.length > 50) {
            logContent.removeChild(logContent.firstChild);
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    hideMobileControls() {
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
    }
}

export { UIManager };