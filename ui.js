class UIManager {
    constructor(config) {
        this.config = config;
        this.isMobile = false;
        this.notifications = [];
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            characterSelect: document.getElementById('character-select'),
            narratorText: document.getElementById('narrator-text'),
            decisionButtons: document.getElementById('decision-buttons'),
            playerInfo: {
                name: document.getElementById('player-name'),
                archetype: document.getElementById('player-archetype'),
                day: document.getElementById('current-day'),
                sanity: document.getElementById('sanity-level'),
            },
            ambientAudio: document.getElementById('ambient-audio'),
            mysterySound: document.getElementById('mystery-sound'),
        };
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeMobileControls();
        this.setupAmbientAudio();
    }

    setupAmbientAudio() {
        try {
            if (this.elements.ambientAudio) {
                this.elements.ambientAudio.volume = this.config.AUDIO.AMBIENT_VOLUME;
                const playPromise = this.elements.ambientAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('Failed to play ambient audio:', error);
                    });
                }
            }

            if (this.elements.mysterySound) {
                this.elements.mysterySound.volume = this.config.AUDIO.MYSTERY_VOLUME;
                const playPromise = this.elements.mysterySound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('Failed to play mystery sound:', error);
                    });
                }
            }
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    showLoadingScreen(duration, onComplete) {
        if (!this.elements.loadingScreen) return;
        setTimeout(() => {
            try {
                this.elements.loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    try {
                        this.elements.loadingScreen.style.display = 'none';
                        if(onComplete) onComplete();
                    } catch (error) {
                        console.warn('Error hiding loading screen:', error);
                    }
                }, this.config.TIMERS.LOADING_SCREEN_HIDDEN);
            } catch (error) {
                console.warn('Error transitioning loading screen:', error);
            }
        }, duration);
    }

    showCharacterSelection(onSelectArchetype) {
        if (!this.elements.characterSelect) return;

        this.elements.characterSelect.classList.remove('hidden');

        const cards = this.elements.characterSelect.querySelectorAll('.archetype-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const archetype = card.dataset.archetype;
                this.elements.characterSelect.classList.add('hidden');
                onSelectArchetype(archetype);
            });
        });
    }

    updateNarratorText(update) {
        if (!this.elements.narratorText) return;

        this.elements.narratorText.innerHTML = `<p>${update.text}</p>`;
        if (update.effects.includes('glitch')) {
            this.elements.narratorText.classList.add('glitch');
            setTimeout(() => this.elements.narratorText.classList.remove('glitch'), this.config.TIMERS.GLITCH_EFFECT);
        }
    }

    showDecisionButtons(decisions, onMakeDecision) {
        if (!this.elements.decisionButtons) return;

        this.elements.decisionButtons.innerHTML = '';
        decisions.forEach((decision, index) => {
            const button = document.createElement('button');
            button.className = 'decision-btn';
            button.textContent = decision.text;
            button.addEventListener('click', () => {
                onMakeDecision(index);
                this.elements.decisionButtons.innerHTML = '';
            });
            this.elements.decisionButtons.appendChild(button);
        });
    }

    updatePlayerInfo(playerData) {
        if (this.elements.playerInfo.name) this.elements.playerInfo.name.textContent = playerData.name;
        if (this.elements.playerInfo.archetype) this.elements.playerInfo.archetype.textContent = playerData.archetype;
        if (this.elements.playerInfo.day) this.elements.playerInfo.day.textContent = playerData.day;
        if (this.elements.playerInfo.sanity) this.elements.playerInfo.sanity.textContent = `${playerData.sanity}%`;
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: 'Courier New', monospace;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
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
                        if (nipplejs && nipplejs.default) {
                            this.setupMobileJoystick(nipplejs.default);
                        } else {
                            console.warn('nipplejs loaded but missing default export');
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