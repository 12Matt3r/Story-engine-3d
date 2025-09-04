class AudioManager {
    constructor(config) {
        this.config = config;
        this.elements = {
            ambientAudio: document.getElementById('ambient-audio'),
            mysterySound: document.getElementById('mystery-sound'),
        };
        this.init();
    }

    init() {
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
}

export { AudioManager };
