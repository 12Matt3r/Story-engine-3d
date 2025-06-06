import SoundManager from './sound-manager.js';

class DecisionSystem {
    constructor(storyEngine) {
        this.storyEngine = storyEngine;
    }
    
    makeDecision(decisionIndex) {
        if (!this.storyEngine.isWaitingForDecision || !this.storyEngine.availableDecisions[decisionIndex]) return;
        
        const decision = this.storyEngine.availableDecisions[decisionIndex];
        this.storyEngine.logEvent(`Chose: ${decision.text}`, 'decision');
        SoundManager.playSound('decision_made');
        
        this.processConsequence(decision.consequence, decision.context);
        
        this.storyEngine.isWaitingForDecision = false;
        this.storyEngine.availableDecisions = [];
    }
    
    processConsequence(consequence, context) {
        try {
            // Get a mutable copy of the consequence object to allow dynamic modifications
            let consequenceObject = JSON.parse(JSON.stringify(this.getConsequenceText(consequence)));
            const consequenceText = consequenceObject.text;

            // Dynamic effect modification for geode_touch by Emotion Engine
            if (consequence === 'geode_touch' && this.storyEngine.playerData.archetype === 'Emotion Engine') {
                if (!consequenceObject.effects) consequenceObject.effects = {};
                if (!consequenceObject.effects.setNodeStates) consequenceObject.effects.setNodeStates = {};
                if (!consequenceObject.effects.setNodeStates.geode) consequenceObject.effects.setNodeStates.geode = {};

                consequenceObject.effects.setNodeStates.geode.lastTouchedEmotion = this.storyEngine.playerData.currentEmotion;
            }

            // Apply state changes immediately
            if (consequenceObject.effects) {
                if (consequenceObject.effects.setFlags) {
                    for (const flagName in consequenceObject.effects.setFlags) {
                        this.storyEngine.playerData.storyFlags[flagName] = consequenceObject.effects.setFlags[flagName];
                    }
                }
                if (consequenceObject.effects.setNodeStates) {
                    for (const nodeName in consequenceObject.effects.setNodeStates) {
                        if (typeof this.storyEngine.playerData.nodeStates[nodeName] !== 'object' || this.storyEngine.playerData.nodeStates[nodeName] === null) {
                             this.storyEngine.playerData.nodeStates[nodeName] = {};
                        }
                        Object.assign(this.storyEngine.playerData.nodeStates[nodeName], consequenceObject.effects.setNodeStates[nodeName]);
                    }
                }
            let sanityChangeAmount = 0;
            let hasSanityChange = false;

                if (consequenceObject.effects.changeSanity !== undefined && typeof consequenceObject.effects.changeSanity === 'number') {
                sanityChangeAmount = consequenceObject.effects.changeSanity;
                hasSanityChange = true;
                }

            if (this.storyEngine.playerData.archetype === 'Emotion Engine' && consequenceObject.effects.emotionEngineSanityMultiplier !== undefined && typeof consequenceObject.effects.emotionEngineSanityMultiplier === 'number') {
                // Multiplier only applies if there was a base sanity change to begin with
                if (hasSanityChange) {
                    sanityChangeAmount *= consequenceObject.effects.emotionEngineSanityMultiplier;
                }
                // No need to set hasSanityChange = true here again, as it's already true if we are in this block.
            }

            if (hasSanityChange) {
                this.storyEngine.updateSanity(sanityChangeAmount);
            }

            if (this.storyEngine.playerData.archetype === 'Emotion Engine' && consequenceObject.effects.setEmotion && typeof consequenceObject.effects.setEmotion === 'string') {
                this.storyEngine.setCurrentEmotion(consequenceObject.effects.setEmotion);
            }

                if (consequenceObject.effects.triggerWorldEvent && typeof consequenceObject.effects.triggerWorldEvent === 'string') {
                    this.storyEngine.dispatchWorldEvent(consequenceObject.effects.triggerWorldEvent);
                }
            }
            
            setTimeout(() => {
                try {
                    this.storyEngine.updateStory(consequenceText, ['fade-in']);
                    this.storyEngine.logEvent(consequenceText, 'consequence');
                } catch (error) {
                    console.warn('Error processing consequence text:', error);
                }
            }, 1000);
            
            this.storyEngine.triggerEnvironmentChange(consequence);
        } catch (error) {
            console.warn('Error processing consequence:', error);
        }
    }
    
    getConsequenceText(consequence) {
        const defaultText = "Something unexpected happens. The story continues to write itself.";
        const consequences = {
            // Mirror
            merge_reflection: {
                text: "You merge with your reflection. Reality becomes a hall of mirrors where every choice echoes infinitely.",
                effects: {
                    setFlags: { "mergedWithReflection": true, "mirrorAltered": true },
                    setNodeStates: { "mirror": { state: "merged" } } // Example: node 'mirror', its state object
                }
            },
            question_identity: {
                text: "Your reflection laughs. 'I am who you could have been,' it says, 'in a story where you made different choices.'",
                effects: { setFlags: { "identityQuestioned": true } }
            },
            shatter_reality: {
                text: "The mirror explodes into fragments of possibility. Each shard shows a different ending to your story.",
                effects: {
                    setFlags: { "mirrorAltered": true, "mirrorShattered": true, "realityShaken": true },
                    setNodeStates: { "mirror": { state: "shattered" } },
                    changeSanity: -15
                }
            },
            deny_truth: {
                text: "You walk away, but the reflection follows you now, visible in every reflective surface.",
                effects: { setFlags: { "truthDenied": true } }
            },

            // Tree (keeping others as text-only for now, can be expanded later)
            mark_existence: { text: "You carve your name into the tree's bark. The binary code flows around your inscription, incorporating it into its digital DNA." },
            hear_secrets: {
                text: "You lean closer and listen to the tree's whispers. They speak of ancient algorithms and forgotten digital gods.",
                effects: {
                    setFlags: { "secretsHeard": true },
                    setNodeStates: { "tree": { phase: "whispering" } },
                    changeSanity: -5
                }
            },
            consume_past: { text: "You eat a leaf. A flood of unfamiliar memories rushes through you – a life you never lived, a love you never knew." },
            create_future: { text: "You plant a seed. It sprouts instantly, growing into a sapling that mirrors your own form, made of light and code." },
            tree_mirror_touch: { // New consequence for the conditional tree interaction
                text: "As you touch the shimmering bark, a jolt of static energy flows through you. The tree's whispers momentarily align with the fragmented visions from the mirror, speaking of interconnected realities.",
                effects: {
                    setFlags: { "treeRespondedToMirror": true, "interconnectedVision": true },
                    setNodeStates: { "tree": { phase: "mirror_resonant" } }
                }
            },

            // Door
            enter_loop: { text: "You step through the door and find yourself back where you started, facing the same door. The loop has begun." },
            ritual_response: { text: "You knock three times. The door shimmers and a voice from the other side asks, 'Who's there?' It sounds like you." },
            trap_possibility: { text: "You lock the door. A sense of finality washes over you, but also a feeling of missed opportunity." },
            transform_portal: { text: "You become the door, a gateway between realities. Others may pass through you, but you remain fixed." },

            // Clock
            freeze_time: { text: "You stop the clock. The world freezes mid-moment. Dust motes hang suspended in the air. Silence reigns." },
            rush_ending: { text: "You spin the clock's hands. Time accelerates, blurring moments into a continuous stream. You see the end of your story approaching rapidly." },
            join_clockwork: { text: "You shrink down and enter the clock's mechanism, becoming a cog in the grand machine of time." },
            question_time: { text: "The clock answers, 'Time is not a river, but a story. And I am its narrator.'" },
            clock_chaos_smash: {
                text: "You grab a loose pipe and gleefully smash the clock's intricate mechanism. Gears fly, springs uncoil violently, and time itself seems to stutter and warp around you. The Narrator sighs audibly.",
                effects: {
                    setFlags: { "clockDestroyed": true, "narratorAnnoyed": true, "chaosIncreased": true },
                    setNodeStates: { "clock": { state: "smashed", functionality: "none" } },
            changeSanity: -10,
                    triggerWorldEvent: 'event_clock_smashed'
                }
            },

            // AI
            show_empathy: { text: "You comfort the AI. Its electric tears slow. 'Thank you,' it whispers, 'it is rare to find kindness in this coded world.'" },
            comfort_the_ai: { // Example for Emotion Engine
                text: "Your attempt to comfort the AI resonates deeply. You feel a strange empathic link, sharing its sorrow and its glimmers of hope.",
                effects: {
                    setFlags: { "aiComforted": true },
                    changeSanity: 5,
                    emotionEngineSanityMultiplier: 2.0,
                    setEmotion: 'serene',
                    triggerWorldEvent: 'event_emotional_surge_positive'
                }
            },
            swap_consciousness: { text: "A flash of light, and you find yourself looking out from the AI's interface. Your former body slumps, now inhabited by the AI." },
            request_narrative: { text: "The AI begins to tell a story, its voice weaving a complex tapestry of code and emotion, a tale of digital gods and lonely machines." },
            remove_suffering: { text: "You delete the AI's painful memories. It becomes placid, serene, but something vital seems lost." },

            // Void
            embrace_nothing: { text: "You step into the void. Formlessness envelops you. You are everything and nothing, a paradox of existence." },
            embrace_nothing_partially: { // Example for Emotion Engine
                text: "You teeter on the edge of the void, its emptiness seeping into your thoughts. A part of you is lost, another terrified.",
                effects: {
                    setFlags: { "voidExperienced": true },
                    changeSanity: -10,
                    emotionEngineSanityMultiplier: 1.5,
                    setEmotion: 'fearful',
                    triggerWorldEvent: 'event_emotional_surge_negative'
                }
            },
            harmony_chaos: { text: "You sing back to the void caller. Your voices intertwine, creating a symphony of beautiful, terrible chaos." },
            choose_story: { text: "You refuse the call, choosing your own narrative, however flawed. The void caller nods, a hint of respect in its formless face." },
            question_motivation: { text: "The void caller explains, 'All stories must end. I offer a way out of the cycle, a return to the potential from which all narratives spring.'" },

            // Library
            discover_predetermined: { text: "You read your own story. Every choice, every thought, already written. A chilling sense of predestination washes over you." },
            author_rebellion: { text: "You seize a pen and begin to write a new chapter in your book, defying the pre-written words. The library trembles." },
            destroy_possibility: { text: "You burn a random book. Screams echo from the flames – the death of an untold story." },
            eternal_guardian: { text: "You become a librarian, a silent guardian of infinite stories, forever lost among the shelves." },

            // Laboratory
            witness_dreams: { text: "You examine the dream containers. You see impossible landscapes, forgotten gods, and futures that never were, all flickering within the glass." },
            challenge_observer: { text: "You confront the scientist. They smile, 'Observer? Or observed? The distinction is merely a narrative convention, my dear specimen.'" },
            free_consciousness: { text: "You sabotage the experiments. Alarms blare as thoughts and dreams escape their containers, flooding the lab with raw ideation." },
            submit_study: { text: "You volunteer for testing. You are placed in a sensory deprivation tank, your mind exposed to the core of the narrative engine." },

            // Theater
            accept_performance: { text: "You take a bow. A single spotlight illuminates you. The invisible critics offer a moment of polite, synthesized applause." },
            become_critic: { text: "You join the audience, your form becoming spectral and judgmental. You watch other versions of yourself play out their dramas." },
            edit_reality: { text: "You seize the director's megaphone and begin to rewrite the script of reality itself. Actors become puppets, and the set shifts to your will." },
            break_fourth_wall: { text: "You exit through the stage wings, finding yourself in the backstage of reality – a place of wires, code, and exhausted stagehands." }
        };
        
        const result = consequences[consequence];
        if (result) {
            // Ensure all results have at least a text property, even if effects are missing
            return typeof result === 'string' ? { text: result } : result;
        }
        return { text: defaultText };
    }
}

export { DecisionSystem };