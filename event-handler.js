import { NarrativeTemplates } from './narrative-templates.js';

class EventHandler {
    constructor(storyEngine) {
        this.storyEngine = storyEngine;
        this.narrativeTemplates = new NarrativeTemplates();
    }
    
    triggerEvent(eventType, title) {
        const narrative = this.narrativeTemplates.get(eventType);
        if (!narrative) return;
        
        const texts = Array.isArray(narrative.texts) ? narrative.texts : [narrative.text];
        const selectedText = texts[Math.floor(Math.random() * texts.length)];
        
        const modifiedText = this.narrativeTemplates.applyArchetypeFilter(
            selectedText, eventType, this.storyEngine.playerData.archetype
        );
        
        this.storyEngine.updateStory(modifiedText);
        this.storyEngine.logEvent(`Interacted with: ${title}`, 'event');
        
        if (narrative.decisions) {
            this.showDecisions(narrative.decisions, eventType);
        }
        
        this.updatePlayerState(eventType);
    }
    
    showDecisions(decisions, context) {
        this.storyEngine.availableDecisions = decisions.map(decision => ({
            ...decision,
            context: context
        }));
        this.storyEngine.isWaitingForDecision = true;
        
        if (this.storyEngine.onDecisionRequired) {
            this.storyEngine.onDecisionRequired(this.storyEngine.availableDecisions);
        }
    }
    
    updatePlayerState(eventType) {
        this.storyEngine.playerData.events.push(eventType);
    }
}

export { EventHandler };

