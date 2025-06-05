import { NarrativeTemplates } from './narrative-templates.js';

class StoryEngine {
    constructor() {
        this.playerData = {
            name: 'Unknown',
            archetype: 'Undefined',
            day: 1,
            sanity: 100,
            events: [],
            decisions: [],
            autoplay: false,
            narratorRelationship: 0,
            behaviorProfile: {
                defiant: 0,
                compliant: 0,
                curious: 0,
                destructive: 0,
                empathetic: 0
            },
            storyFlags: {}, // New: for boolean flags like { mirrorTouched: true }
            nodeStates: {}  // New: for more complex states per node, e.g., { tree: { phase: 'whispering' } }
        };
        
        this.currentStoryState = 'beginning';
        this.storyLog = [];
        this.availableDecisions = [];
        this.isWaitingForDecision = false;
        this.autoPlayEnabled = false;
        
        this.narrativeTemplates = new NarrativeTemplates();
        
        this.onStoryUpdate = null;
        this.onDecisionRequired = null;
        this.onEnvironmentChange = null;
    }
    
    logEvent(content, type = 'event') {
        try {
            const logEntry = {
                content: content,
                type: type,
                timestamp: Date.now(),
                day: this.playerData.day,
                sanity: this.playerData.sanity
            };
            
            this.storyLog.push(logEntry);
            
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                try {
                    const customEvent = new CustomEvent('story-log-update', {
                        detail: logEntry
                    });
                    window.dispatchEvent(customEvent);
                } catch (eventError) {
                    console.warn('Error dispatching story log event:', eventError);
                }
            }
        } catch (error) {
            console.warn('Error logging event:', error);
            // Continue without logging if there's an error
        }
    }
    
    updateStory(text, effects = []) {
        try {
            if (this.onStoryUpdate && typeof this.onStoryUpdate === 'function') {
                this.onStoryUpdate({
                    text: text,
                    effects: effects
                });
            }
        } catch (error) {
            console.warn('Error updating story:', error);
        }
    }
    
    setPlayerArchetype(archetype) {
        try {
            this.playerData.archetype = archetype;
            this.logEvent(`Player archetype set: ${archetype}`, 'system');
        } catch (error) {
            console.warn('Error setting archetype:', error);
            this.playerData.archetype = archetype;
        }
    }
    
    beginStory() {
        try {
            const narrative = this.narrativeTemplates.get('beginning');
            this.updateStory(narrative.text, narrative.effects);
            this.logEvent("Story begins", 'narrator');
        } catch (error) {
            console.warn('Error beginning story:', error);
            this.updateStory("You find yourself in a strange place where stories come to life.", []);
        }
    }
    
    canAdvance() {
        return !this.isWaitingForDecision;
    }
    
    advance() {
        if (this.canAdvance()) {
            this.triggerRandomEvent();
        }
    }
    
    triggerRandomEvent() {
        try {
            const randomEvents = [
                "The narrator forgets your name for a moment and calls you 'Character #1'.",
                "You notice you're casting a shadow that belongs to someone else.",
                "The fourth wall flickers. For a second, you see the code that generates this world.",
                "Reality glitches slightly. You feel like you're being watched.",
                "The narrator pauses mid-sentence, as if distracted by something else.",
                "You hear the sound of typing, but there's no keyboard visible."
            ];
            
            const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
            
            setTimeout(() => {
                try {
                if (!this.isWaitingForDecision) {
                    this.updateStory(event, ['glitch']);
                    this.logEvent(event, 'random');
                }
                } catch (error) {
                    console.warn('Error triggering random event:', error);
                }
            }, 2000 + Math.random() * 3000);
        } catch (error) {
            console.warn('Error in triggerRandomEvent:', error);
        }
    }
}

export { StoryEngine };