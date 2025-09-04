import { NarratorPersonality } from './narrator-personality.js';
import { MemorySystem } from './memory-system.js';
import { StoryEngine } from './story-engine.js';
import { DecisionSystem } from './decision-system.js';
import { StoryAnalysis } from './story-analysis.js';
import { EventHandler } from './event-handler.js';

class StoryManager {
    constructor() {
        this.storyEngine = new StoryEngine();
        this.decisionSystem = new DecisionSystem(this.storyEngine);
        this.storyAnalysis = new StoryAnalysis(this.storyEngine);
        this.eventHandler = new EventHandler(this.storyEngine);
        this.narratorPersonality = new NarratorPersonality();
        this.memoryBank = new MemorySystem();
    }
    
    // Proxy methods to maintain compatibility
    get playerData() { return this.storyEngine.playerData; }
    get storyLog() { return this.storyEngine.storyLog; }
    get isWaitingForDecision() { return this.storyEngine.isWaitingForDecision; }
    get availableDecisions() { return this.storyEngine.availableDecisions; }
    
    set onStoryUpdate(callback) { this.storyEngine.onStoryUpdate = callback; }
    set onDecisionRequired(callback) { this.storyEngine.onDecisionRequired = callback; }
    set onEnvironmentChange(callback) { this.storyEngine.onEnvironmentChange = callback; }
    
    logEvent(content, type) { return this.storyEngine.logEvent(content, type); }
    updateStory(text, effects) { return this.storyEngine.updateStory(text, effects); }
    setPlayerArchetype(archetype) { return this.storyEngine.setPlayerArchetype(archetype); }
    beginStory() { return this.storyEngine.beginStory(); }
    canAdvance() { return this.storyEngine.canAdvance(); }
    advance() { return this.storyEngine.advance(); }
    
    triggerEvent(eventType, title) { return this.eventHandler.triggerEvent(eventType, title); }
    makeDecision(decisionIndex) { return this.decisionSystem.makeDecision(decisionIndex); }
    exportStory() { return this.storyAnalysis.exportStory(); }
    
    triggerEnvironmentChange(consequence) {
        try {
            if (this.storyEngine.onEnvironmentChange) {
                this.storyEngine.onEnvironmentChange({
                    type: 'story_change',
                    consequence: consequence,
                    intensity: Math.random() * 0.5 + 0.5
                });
            }
        } catch (error) {
            console.warn('Error triggering environment change:', error);
        }
    }
}

// Export the StoryManager
export { StoryManager };