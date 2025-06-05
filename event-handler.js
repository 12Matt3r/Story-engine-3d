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

