class DecisionSystem {
    constructor(storyEngine) {
        this.storyEngine = storyEngine;
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
            merge_reflection: "You merge with your reflection. Reality becomes a hall of mirrors where every choice echoes infinitely.",
            question_identity: "Your reflection laughs. 'I am who you could have been,' it says, 'in a story where you made different choices.'",
            shatter_reality: "The mirror explodes into fragments of possibility. Each shard shows a different ending to your story.",
            deny_truth: "You walk away, but the reflection follows you now, visible in every reflective surface."
        };
        
        return consequences[consequence] || "Something unexpected happens. The story continues to write itself.";
    }
}

export { DecisionSystem };