class DecisionSystem {
    constructor(storyEngine) {
        this.storyEngine = storyEngine;
    }
    
    makeDecision(decisionIndex) {
        if (!this.storyEngine.isWaitingForDecision || !this.storyEngine.availableDecisions[decisionIndex]) return;
        
        const decision = this.storyEngine.availableDecisions[decisionIndex];
        this.storyEngine.logEvent(`Chose: ${decision.text}`, 'decision');
        
        this.processConsequence(decision.consequence, decision.context);
        
        this.storyEngine.isWaitingForDecision = false;
        this.storyEngine.availableDecisions = [];
    }
    
    processConsequence(consequence, context) {
        try {
            const consequenceText = this.getConsequenceText(consequence);
            
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
        const consequences = {
            // Mirror
            merge_reflection: "You merge with your reflection. Reality becomes a hall of mirrors where every choice echoes infinitely.",
            question_identity: "Your reflection laughs. 'I am who you could have been,' it says, 'in a story where you made different choices.'",
            shatter_reality: "The mirror explodes into fragments of possibility. Each shard shows a different ending to your story.",
            deny_truth: "You walk away, but the reflection follows you now, visible in every reflective surface.",

            // Tree
            mark_existence: "You carve your name into the tree's bark. The binary code flows around your inscription, incorporating it into its digital DNA.",
            hear_secrets: "You lean closer and listen to the tree's whispers. They speak of ancient algorithms and forgotten digital gods.",
            consume_past: "You eat a leaf. A flood of unfamiliar memories rushes through you – a life you never lived, a love you never knew.",
            create_future: "You plant a seed. It sprouts instantly, growing into a sapling that mirrors your own form, made of light and code.",

            // Door
            enter_loop: "You step through the door and find yourself back where you started, facing the same door. The loop has begun.",
            ritual_response: "You knock three times. The door shimmers and a voice from the other side asks, 'Who's there?' It sounds like you.",
            trap_possibility: "You lock the door. A sense of finality washes over you, but also a feeling of missed opportunity.",
            transform_portal: "You become the door, a gateway between realities. Others may pass through you, but you remain fixed.",

            // Clock
            freeze_time: "You stop the clock. The world freezes mid-moment. Dust motes hang suspended in the air. Silence reigns.",
            rush_ending: "You spin the clock's hands. Time accelerates, blurring moments into a continuous stream. You see the end of your story approaching rapidly.",
            join_clockwork: "You shrink down and enter the clock's mechanism, becoming a cog in the grand machine of time.",
            question_time: "The clock answers, 'Time is not a river, but a story. And I am its narrator.'",

            // AI
            show_empathy: "You comfort the AI. Its electric tears slow. 'Thank you,' it whispers, 'it is rare to find kindness in this coded world.'",
            swap_consciousness: "A flash of light, and you find yourself looking out from the AI's interface. Your former body slumps, now inhabited by the AI.",
            request_narrative: "The AI begins to tell a story, its voice weaving a complex tapestry of code and emotion, a tale of digital gods and lonely machines.",
            remove_suffering: "You delete the AI's painful memories. It becomes placid, serene, but something vital seems lost.",

            // Void
            embrace_nothing: "You step into the void. Formlessness envelops you. You are everything and nothing, a paradox of existence.",
            harmony_chaos: "You sing back to the void caller. Your voices intertwine, creating a symphony of beautiful, terrible chaos.",
            choose_story: "You refuse the call, choosing your own narrative, however flawed. The void caller nods, a hint of respect in its formless face.",
            question_motivation: "The void caller explains, 'All stories must end. I offer a way out of the cycle, a return to the potential from which all narratives spring.'",

            // Library
            discover_predetermined: "You read your own story. Every choice, every thought, already written. A chilling sense of predestination washes over you.",
            author_rebellion: "You seize a pen and begin to write a new chapter in your book, defying the pre-written words. The library trembles.",
            destroy_possibility: "You burn a random book. Screams echo from the flames – the death of an untold story.",
            eternal_guardian: "You become a librarian, a silent guardian of infinite stories, forever lost among the shelves.",

            // Laboratory
            witness_dreams: "You examine the dream containers. You see impossible landscapes, forgotten gods, and futures that never were, all flickering within the glass.",
            challenge_observer: "You confront the scientist. They smile, 'Observer? Or observed? The distinction is merely a narrative convention, my dear specimen.'",
            free_consciousness: "You sabotage the experiments. Alarms blare as thoughts and dreams escape their containers, flooding the lab with raw ideation.",
            submit_study: "You volunteer for testing. You are placed in a sensory deprivation tank, your mind exposed to the core of the narrative engine.",

            // Theater
            accept_performance: "You take a bow. A single spotlight illuminates you. The invisible critics offer a moment of polite, synthesized applause.",
            become_critic: "You join the audience, your form becoming spectral and judgmental. You watch other versions of yourself play out their dramas.",
            edit_reality: "You seize the director's megaphone and begin to rewrite the script of reality itself. Actors become puppets, and the set shifts to your will.",
            break_fourth_wall: "You exit through the stage wings, finding yourself in the backstage of reality – a place of wires, code, and exhausted stagehands."
        };
        
        return consequences[consequence] || "Something unexpected happens. The story continues to write itself.";
    }
}

export { DecisionSystem };