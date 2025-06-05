import { NarrativeTemplates } from './narrative-templates.js';

class EventHandler {
    constructor(storyEngine) {
        this.storyEngine = storyEngine;
        this.narrativeTemplates = new NarrativeTemplates();
    }
    
    triggerEvent(eventType, title) {
        const narrative = this.narrativeTemplates.get(eventType);
        if (!narrative) return;
        
        const baseTexts = Array.isArray(narrative.texts) ? narrative.texts : (narrative.text ? [narrative.text] : [""]);
        let chosenText = baseTexts[Math.floor(Math.random() * baseTexts.length)];
        let rawDecisions = narrative.decisions ? JSON.parse(JSON.stringify(narrative.decisions)) : []; // Deep clone

        // --- Archetype-specific decision filtering ---
        if (rawDecisions.length > 0) {
            rawDecisions = rawDecisions.filter(decision => {
                return !decision.archetypeCondition || decision.archetypeCondition === this.storyEngine.playerData.archetype;
            });
        }
        let currentDecisions = rawDecisions; // currentDecisions will now be the filtered list or empty

        // --- Conditional Logic Start (for story flags, can modify currentDecisions further) ---
        if (eventType === 'tree' && this.storyEngine.playerData.storyFlags && this.storyEngine.playerData.storyFlags.mirrorAltered === true) {
            chosenText = "The tree shimmers with a faint, reflected light. " + chosenText;
            currentDecisions.push({ text: "Touch the shimmering bark", consequence: "tree_mirror_touch" }); // Add to already filtered list
        }
        // --- Conditional Logic End ---
        
        const modifiedText = this.narrativeTemplates.applyArchetypeFilter(
            chosenText, eventType, this.storyEngine.playerData.archetype
        );
        
        this.storyEngine.updateStory(modifiedText, narrative.effects);
        this.storyEngine.logEvent(`Interacted with: ${title}`, 'event');

        // --- Silent Observer Insight Start ---
        if (this.storyEngine.playerData.archetype === 'Silent Observer') {
            let insightText = null;
            if (eventType === 'mirror') {
                insightText = "You notice a faint inscription on the mirror's frame, almost invisible to a casual glance. It seems to be a warning.";
            } else if (eventType === 'tree') {
                insightText = "The shifting binary code on the tree bark occasionally forms patterns resembling ancient star charts.";
            }

            if (insightText) {
                this.storyEngine.logEvent(insightText, 'observer_insight');
            }
        }
        // --- Silent Observer Insight End ---
        
        if (currentDecisions.length > 0) {
            this.showDecisions(currentDecisions, eventType);
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

