// sound-manager.js
class SoundManager {
    constructor() {
        this.sounds = {}; // To cache audio elements
        this.muted = false; // Basic mute functionality
        this.masterVolume = 0.7; // Master volume control (0.0 to 1.0)
        this.debug = false; // Set to true for more console logs
    }

    playSound(soundName) {
        if (this.muted) {
            if (this.debug) console.log(`[SoundManager] Sounds muted, not playing: ${soundName}`);
            return;
        }

        const soundId = `sfx-${soundName}`;
        let audioElement = this.sounds[soundId];

        // Check if document is available (i.e., not in Node.js test environment without JSDOM)
        if (typeof document === 'undefined') {
            if (this.debug) console.log(`[SoundManager] Document not available, cannot play sound: ${soundName}`);
            return;
        }

        if (!audioElement) {
            audioElement = document.getElementById(soundId);
            if (audioElement) {
                this.sounds[soundId] = audioElement;
                if (this.debug) console.log(`[SoundManager] Found and cached: ${soundId}`);
            } else {
                console.warn(`[SoundManager] Sound not found in DOM: ${soundId}`);
                return;
            }
        }

        if (audioElement instanceof HTMLAudioElement && typeof audioElement.play === 'function') {
            audioElement.volume = this.masterVolume;
            audioElement.currentTime = 0; // Rewind to start

            if (this.debug) console.log(`[SoundManager] Attempting to play: ${soundId} at volume ${audioElement.volume}`);

            audioElement.play().then(() => {
                if (this.debug) console.log(`[SoundManager] Playback started for: ${soundId}`);
            }).catch(error => {
                console.warn(`[SoundManager] Error playing sound ${soundId}:`, error.message);
                // Common issue: "play() failed because the user didn't interact with the document first."
                // Or "The play() request was interrupted by a call to pause() or load()."
            });
        } else {
            console.warn(`[SoundManager] Invalid audio element or play method missing for: ${soundId}`);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            Object.values(this.sounds).forEach(sound => {
                if (sound instanceof HTMLAudioElement && !sound.paused) {
                    sound.pause();
                    // Note: We don't reset currentTime here when muting via pause.
                }
            });
        }
        console.log(`[SoundManager] Sounds ${this.muted ? 'muted' : 'unmuted'}.`);
        if (this.debug && !this.muted) console.log(`[SoundManager] Master volume is currently: ${this.masterVolume * 100}%`);
        return this.muted;
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
        console.log(`[SoundManager] Master volume set to: ${this.masterVolume * 100}%`);

        Object.values(this.sounds).forEach(sound => {
            if (sound instanceof HTMLAudioElement) {
                sound.volume = this.masterVolume;
            }
        });
    }
}

const soundManagerInstance = new SoundManager();
export default soundManagerInstance;
