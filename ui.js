class UIManager {
    constructor() {
        this.isMobile = false;
        this.notifications = [];
        this.journalEntries = []; // Store all entries for the journal
        this.journalModal = null;
        this.journalEntriesContainer = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeMobileControls();
        this.initializeJournal(); // Call to setup journal elements and listeners
    }

    initializeJournal() {
        this.journalModal = document.getElementById('journal-modal');
        this.journalEntriesContainer = document.getElementById('journal-entries');
        const toggleJournalBtn = document.getElementById('toggle-journal-btn');
        const closeJournalBtn = document.getElementById('close-journal-btn');

        if (toggleJournalBtn && this.journalModal) {
            toggleJournalBtn.addEventListener('click', this.toggleJournal.bind(this));
        }
        if (closeJournalBtn && this.journalModal) {
            closeJournalBtn.addEventListener('click', this.toggleJournal.bind(this));
        }
        // Optional: Add click outside to close listener for journalModal if desired
    }

    toggleJournal() {
        if (!this.journalModal) return;
        const isHidden = this.journalModal.classList.toggle('hidden');
        if (!isHidden) { // If modal is now visible
            this.renderJournalEntries();
        }
    }

    renderJournalEntries() {
        if (!this.journalEntriesContainer) return;
        this.journalEntriesContainer.innerHTML = ''; // Clear existing entries

        this.journalEntries.slice().reverse().forEach(entry => { // Newest first
            const entryDiv = document.createElement('div');
            // Apply base log entry styling and type-specific styling
            entryDiv.className = `journal-entry log-entry log-entry-${entry.type}`;

            // Apply special styling for observer insights, consistent with addLogEntry
            if (entry.type === 'observer_insight') {
                entryDiv.classList.add('insight-text');
                // entryDiv.style.fontStyle = 'italic'; // Prefer CSS for these
                // entryDiv.style.color = '#aabbff';
            } else if (entry.type === 'oracle_glimpse') {
                entryDiv.classList.add('glimpse-text');
                // entryDiv.style.color = '#ffd700';
                // entryDiv.style.borderLeft = '3px solid #ffd700';
                // entryDiv.style.paddingLeft = '5px';
            }

            const metaP = document.createElement('p');
            metaP.className = 'journal-entry-meta';
            metaP.textContent = `Day ${entry.day} - Type: ${entry.type}`; // Simplified meta for now

            const contentP = document.createElement('p');
            contentP.className = 'journal-entry-content';
            contentP.textContent = entry.content;

            entryDiv.appendChild(metaP);
            entryDiv.appendChild(contentP);
            this.journalEntriesContainer.appendChild(entryDiv);
        });
        this.journalEntriesContainer.scrollTop = 0; // Scroll to top
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
        // Add to the main story log (bottom right, last 50)
        const logContent = document.getElementById('log-content');
        if (logContent) {
            const entryElement = document.createElement('div');
            entryElement.className = `log-entry ${logEntry.type}`;
            if (logEntry.type === 'observer_insight') {
              entryElement.classList.add('insight-text');
              // Direct styling kept for consistency, though CSS is preferred
              entryElement.style.fontStyle = 'italic';
              entryElement.style.color = '#aabbff';
            } else if (logEntry.type === 'oracle_glimpse') {
              entryElement.classList.add('glimpse-text');
              entryElement.style.color = '#ffd700'; // Gold color
              entryElement.style.borderLeft = '3px solid #ffd700';
              entryElement.style.paddingLeft = '5px';
            }
            entryElement.textContent = logEntry.content;

            logContent.appendChild(entryElement);
            logContent.scrollTop = logContent.scrollHeight; // Auto-scroll

            while (logContent.children.length > 50) {
                logContent.removeChild(logContent.firstChild);
            }
        }

        // Add to the persistent journal entries array
        this.journalEntries.push(logEntry);

        // If journal is currently open, re-render it (or just append, but re-render is simpler for now)
        if (this.journalModal && !this.journalModal.classList.contains('hidden')) {
            this.renderJournalEntries();
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