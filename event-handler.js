import { NarrativeTemplates } from './narrative-templates.js';
import SoundManager from './sound-manager.js';

class EventHandler {
    constructor(storyEngine) {
        this.storyEngine = storyEngine;
        this.narrativeTemplates = new NarrativeTemplates();
    }
    
    triggerEvent(eventType, title) {
        SoundManager.playSound('node_interact'); // Play sound on any node interaction
        const narrative = this.narrativeTemplates.get(eventType);
        if (!narrative) return;
        
        const baseTexts = Array.isArray(narrative.texts) ? narrative.texts : (narrative.text ? [narrative.text] : [""]);
        let chosenText = baseTexts[Math.floor(Math.random() * baseTexts.length)];
        let rawDecisions = narrative.decisions ? JSON.parse(JSON.stringify(narrative.decisions)) : []; // Deep clone

        // --- Puzzle Logic: Locked Door Check ---
        if (eventType === 'locked_door_main') {
            if (this.storyEngine.playerData.storyFlags && this.storyEngine.playerData.storyFlags.lever_alpha_pulled === true) {
                // Door is unlocked, proceed with template's text/decisions (which should be the "unlocked" state)
                // chosenText and rawDecisions are already populated from the template
            } else {
                chosenText = "The massive door is bolted shut. Perhaps a nearby mechanism controls it.";
                rawDecisions = []; // No decisions, or perhaps an "Examine Lock" decision
            }
        }

        // --- Archetype-specific and Conditional Decision Filtering ---
        let currentDecisions = [];
        if (rawDecisions.length > 0) {
            currentDecisions = rawDecisions.filter(decision => {
                // Archetype condition
                if (decision.archetypeCondition && decision.archetypeCondition !== this.storyEngine.playerData.archetype) {
                    return false;
                }
                // Flag condition
                if (decision.conditionFlag && (!this.storyEngine.playerData.storyFlags || !this.storyEngine.playerData.storyFlags[decision.conditionFlag])) {
                    return false;
                }
                // Emotion condition
                if (decision.emotionCondition) {
                    if (decision.emotionCondition.archetype !== this.storyEngine.playerData.archetype ||
                        decision.emotionCondition.emotion !== this.storyEngine.playerData.currentEmotion) {
                        return false;
                    }
                }
                return true;
            });
        }
        // --- End Decision Filtering ---


        // --- Story Flag-Based Event Modification (Example for 'tree' and 'mirrorAltered' flag) ---
        // This specific flag-based modification adds a decision, so it runs after initial filtering.
        if (eventType === 'tree' && this.storyEngine.playerData.storyFlags && this.storyEngine.playerData.storyFlags.mirrorAltered === true) {
            chosenText = "The tree shimmers with a faint, reflected light. " + chosenText;
            // Ensure not to duplicate if already added or if it's a core part of a filtered list above
            const newTreeDecision = { text: "Touch the shimmering bark", consequence: "tree_mirror_touch" };
            if (!currentDecisions.find(d => d.consequence === "tree_mirror_touch")) {
                 currentDecisions.push(newTreeDecision);
            }
        }
        // --- End Story Flag-Based Event Modification ---

        let textToDisplay = this.narrativeTemplates.applyArchetypeFilter(
            chosenText, eventType, this.storyEngine.playerData.archetype
        );

        // --- Sanity-Based Text Effects Start ---
        const currentSanity = this.storyEngine.playerData.sanity;
        if (currentSanity < 40) {
            const randomEffect = Math.random();
            if (randomEffect < 0.4) { // 40% chance for word scramble
                textToDisplay = textToDisplay.split(' ').map(word => {
                    if (word.length > 3 && Math.random() < 0.25) { // Affect ~25% of longer words
                        let chars = word.split('');
                        // Fisher-Yates shuffle for inner characters (leave first and last)
                        if (chars.length > 2) { // Ensure there are inner characters to shuffle
                            for (let k = chars.length - 2; k > 0; k--) { // Iterate from second to last up to second char
                                const j = Math.floor(Math.random() * (k + 1)); // Random index from 0 to k
                                if (j !== 0 && k !== 0) { // Avoid swapping first char, ensure j is also not first
                                     // Let's simplify: scramble all but first and last
                                }
                            }
                             // Simplified scramble: keep first/last, scramble middle
                            const firstChar = chars.shift();
                            const lastChar = chars.length > 0 ? chars.pop() : '';
                            for (let k = chars.length - 1; k > 0; k--) {
                                const j = Math.floor(Math.random() * (k + 1));
                                [chars[k], chars[j]] = [chars[j], chars[k]];
                            }
                            return firstChar + chars.join('') + lastChar;
                        }
                        return chars.join(''); // Should not happen if length > 2 check is right
                    }
                    return word;
                }).join(' ');
                textToDisplay = "[Your thoughts feel scrambled] " + textToDisplay;
            } else if (randomEffect < 0.7) { // 30% chance for intrusive phrase (total 40+30=70%)
                const unsettlingPhrases = ["...are you sure?", "...it's all unreal...", "...they're watching...", "...can't trust it..."];
                textToDisplay += " " + unsettlingPhrases[Math.floor(Math.random() * unsettlingPhrases.length)];
            }
            // Else (30% chance): no specific text distortion for this event, visual effects might still apply
        }
        // --- Sanity-Based Text Effects End ---
        
        this.storyEngine.updateStory(textToDisplay, narrative.effects);
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
        // --- Golden Masked Oracle Glimpse Start ---
        if (this.storyEngine.playerData.archetype === 'Golden Masked Oracle' && decisions && decisions.length > 0) {
            const GLIMPSE_CHANCE = 0.25; // 25% chance
            if (Math.random() < GLIMPSE_CHANCE) {
                const randomDecisionIndex = Math.floor(Math.random() * decisions.length);
                const glimpsedDecision = decisions[randomDecisionIndex];

                const glimpseMessage = `[Oracle's Glimpse]: You sense that choosing '${glimpsedDecision.text}' might lead to an outcome related to '${glimpsedDecision.consequence}'.`;
                this.storyEngine.logEvent(glimpseMessage, 'oracle_glimpse');
            }
        }
        // --- Golden Masked Oracle Glimpse End ---

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

