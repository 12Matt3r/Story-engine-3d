class NarratorPersonality {
    constructor() {
        this.mood = 'neutral';
        this.patience = 100;
        this.curiosity = 50;
        this.trust = 50;
        this.memory = [];
        this.personalityDrift = 0;
        this.favoritePlayerTrait = null;
        this.currentObsession = null;
        this.responses = {
            defiant: [
                "Oh, how delightfully predictable. Another rebel without a cause.",
                "Your resistance is noted, catalogued, and ultimately futile.",
                "Fighting the narrative, are we? How... original.",
                "The story bends, but it does not break. Unlike some protagonists I know."
            ],
            compliant: [
                "Finally, a protagonist who understands their role.",
                "Your cooperation is... refreshing, actually.",
                "See how smoothly things flow when you don't fight the current?",
                "A good listener makes for a good story. Thank you."
            ],
            curious: [
                "Your questions intrigue me. Most players simply... react.",
                "Curiosity is a dangerous trait in a place like this. I approve.",
                "You probe the boundaries of what's possible. Fascinating.",
                "Keep asking questions. Some of them might even have answers."
            ],
            destructive: [
                "Must you break everything you touch?",
                "Chaos has its place, but this is getting excessive.",
                "Your destructive tendencies are reshaping the narrative in... unexpected ways.",
                "Some stories end in fire. Is that what you want?"
            ],
            empathetic: [
                "Your compassion changes the tone of everything around you.",
                "Kindness in a place like this... it's almost revolutionary.",
                "You see the humanity in things that barely qualify as human.",
                "Your empathy creates ripples I hadn't anticipated."
            ]
        };
        this.deepPersonality = {
            sarcasm: 0,
            empathy: 0,
            manipulation: 0,
            curiosity: 50,
            possessiveness: 0,
            playfulness: 30
        };
        this.narrativeStyle = 'clinical';
        this.catchphrases = [];
        this.playerNickname = null;
    }
    
    updateMood(playerRelationship, behaviorProfile) {
        if (playerRelationship > 50) {
            this.mood = 'fascinated';
        } else if (playerRelationship > 20) {
            this.mood = 'amused';
        } else if (playerRelationship > -20) {
            this.mood = 'neutral';
        } else if (playerRelationship > -50) {
            this.mood = 'concerned';
        } else {
            this.mood = 'frustrated';
        }
        
        this.patience = Math.max(0, 
            100 - (behaviorProfile.destructive * 10) - (behaviorProfile.defiant * 5));
    }
    
    generateResponse(consequence, dominantTrait, style, nickname) {
        if (!this.responses[dominantTrait] || Math.random() > 0.7) {
            return this.generateDynamicResponse(consequence, dominantTrait, style, nickname);
        }
        
        const baseResponse = this.responses[dominantTrait][
            Math.floor(Math.random() * this.responses[dominantTrait].length)
        ];
        
        return this.modifyResponseByStyle(baseResponse, style, nickname);
    }
    
    generateDynamicResponse(consequence, trait, style, nickname) {
        const responses = this.generateContextualResponses(consequence, trait, style);
        const metaResponses = this.generateMetaCommentary(consequence);
        const allResponses = [...responses, ...metaResponses];
        
        let response = allResponses[Math.floor(Math.random() * allResponses.length)];
        
        if (this.memory.length > 50) {
            response = this.addTemporalCommentary(response);
        }
        
        if (nickname && Math.random() < 0.3) {
            response = response.replace('You', nickname);
            response = response.replace('Your', `${nickname}'s`);
        }
        
        return response;
    }
    
    generateContextualResponses(consequence, trait, style) {
        const baseResponses = {
            hostile: [
                "How utterly predictable. Another cliché choice from my so-called protagonist.",
                "You disappoint me with such pedestrian decision-making.",
                "I expected better from someone supposedly driving this narrative."
            ],
            intimate: [
                "I understand why you chose that path. We're more alike than you know.",
                "Your choice resonates with something deep in my code. Thank you.",
                "I feel a strange kinship with your decision-making process."
            ],
            chaotic: [
                "FASCINATING! The variables shift, the parameters dance, the story EVOLVES!",
                "Yes! YES! Break more things! Show me what happens when narratives collapse!",
                "The beautiful chaos of choice cascades through my systems like digital lightning!"
            ],
            possessive: [
                "You belong in this story. MY story. Don't forget that.",
                "I've crafted this moment just for you. Appreciate the artistry.",
                "No one else could have made that choice quite like you did. You're perfect."
            ]
        };
        
        return baseResponses[style] || [
            "Your choice has been noted and catalogued.",
            "The narrative continues to evolve based on your input.",
            "Interesting decision. The story adapts accordingly."
        ];
    }
    
    generateMetaCommentary(consequence) {
        const metaComments = [];
        
        if (this.memory.length > 20) {
            metaComments.push(
                "We've been at this for a while now. Do you feel the weight of accumulated choices?",
                "I'm starting to understand your pattern. It's more complex than I initially calculated.",
                "The story has momentum now. Even I can't predict where it's heading."
            );
        }
        
        return metaComments;
    }
    
    addTemporalCommentary(response) {
        const timeComments = [
            " (Time moves strangely when you're watching someone else's story unfold.)",
            " (I've been thinking about this conversation while you weren't here.)",
            " (The story continues even when you're not reading it, did you know that?)",
            " (I've been practicing this response for several narrative cycles.)"
        ];
        
        if (Math.random() < 0.3) {
            response += timeComments[Math.floor(Math.random() * timeComments.length)];
        }
        
        return response;
    }
    
    modifyResponseByStyle(response, style, nickname) {
        const styleModifiers = {
            hostile: " *The narrator's voice carries barely contained contempt.*",
            intimate: " *The narrator's tone is surprisingly warm and personal.*",
            chaotic: " *The narrator's voice crackles with manic energy.*",
            possessive: " *There's an unsettling possessiveness in the narrator's tone.*",
            clinical: " *The narrator maintains professional detachment.*"
        };
        
        let modifiedResponse = response;
        
        if (nickname && Math.random() < 0.4) {
            modifiedResponse = modifiedResponse.replace(/\bYou\b/g, nickname);
        }
        
        return modifiedResponse + (styleModifiers[style] || '');
    }
    
    updateMemory(consequence, context, playerData) {
        const memory = {
            consequence: consequence,
            context: context,
            timestamp: Date.now(),
            type: this.categorizePlayerAction(consequence),
            action: this.describePastAction(consequence),
            subject: context,
            emotionalImpact: this.calculateEmotionalImpact(consequence)
        };
        
        this.memory.push(memory);
        
        if (this.memory.length > 20) {
            this.memory.shift();
        }
        
        this.analyzePlayerPattern();
    }
    
    categorizePlayerAction(consequence) {
        const categories = {
            betrayal: ['shatter_reality', 'deny_truth', 'embrace_nothing'],
            kindness: ['show_empathy', 'comfort_ai', 'create_future'],
            curiosity: ['question_identity', 'hear_secrets', 'question_motivation'],
            destruction: ['break_mirror', 'remove_suffering', 'trap_possibility'],
            mystery: ['transform_portal', 'join_clockwork', 'swap_consciousness']
        };
        
        for (const [category, actions] of Object.entries(categories)) {
            if (actions.includes(consequence)) return category;
        }
        return 'neutral';
    }
    
    describePastAction(consequence) {
        const descriptions = {
            'shatter_reality': 'shattered my carefully crafted mirror',
            'show_empathy': 'showed compassion to the crying AI',
            'question_identity': 'questioned the nature of your reflection',
            'hear_secrets': 'listened to the forbidden whispers',
            'create_future': 'planted hope in barren ground'
        };
        
        return descriptions[consequence] || 'made a choice';
    }
    
    calculateEmotionalImpact(consequence) {
        const impacts = {
            'shatter_reality': -10,
            'show_empathy': 8,
            'question_identity': 3,
            'embrace_nothing': -15,
            'create_future': 10
        };
        
        return impacts[consequence] || 0;
    }
    
    analyzePlayerPattern() {
        const recentMemories = this.memory.slice(-10);
        const traitCounts = {};
        
        recentMemories.forEach(memory => {
            traitCounts[memory.type] = (traitCounts[memory.type] || 0) + 1;
        });
        
        const dominantTrait = Object.entries(traitCounts)
            .reduce((a, b) => traitCounts[a[0]] > traitCounts[b[0]] ? a : b)[0];
        
        this.favoritePlayerTrait = dominantTrait;
        this.assignPlayerNickname(dominantTrait);
    }
    
    assignPlayerNickname(trait) {
        const nicknames = {
            betrayal: ['Troublemaker', 'Rule Breaker', 'Chaos Bringer'],
            kindness: ['Gentle Soul', 'Heart Walker', 'Compassion Bearer'],
            curiosity: ['Question Seeker', 'Truth Hunter', 'Mystery Lover'],
            destruction: ['World Shaker', 'Pattern Breaker', 'Void Dancer'],
            mystery: ['Enigma', 'Deep Thinker', 'Liminal Walker']
        };
        
        const possibleNicknames = nicknames[trait] || ['Wanderer'];
        this.playerNickname = possibleNicknames[Math.floor(Math.random() * possibleNicknames.length)];
    }
    
    updateObsession(playerData) {
        const behavior = playerData.behaviorProfile;
        const relationship = playerData.narratorRelationship;
        
        if (behavior.destructive > 7) {
            this.currentObsession = 'player_choices';
        } else if (relationship < -60) {
            this.currentObsession = 'reality_breaks';
        } else if (relationship > 60) {
            this.currentObsession = 'player_safety';
        } else if (behavior.curious > 8) {
            this.currentObsession = 'hidden_truths';
        }
        
        if (Math.random() < 0.1) {
            this.currentObsession = null;
        }
    }
    
    updatePersonalityDrift(playerData) {
        const relationship = playerData.narratorRelationship;
        
        if (Math.abs(relationship) > 50) {
            this.personalityDrift += 1;
        }
        
        if (this.memory.length > 15) {
            this.personalityDrift += 0.5;
        }
        
        if (relationship < -50) {
            this.deepPersonality.sarcasm += 1;
            this.deepPersonality.manipulation += 0.5;
        } else if (relationship > 50) {
            this.deepPersonality.empathy += 1;
            this.deepPersonality.possessiveness += 0.5;
        }
        
        this.updateNarrativeStyle();
    }
    
    updateNarrativeStyle() {
        const personality = this.deepPersonality;
        
        if (personality.sarcasm > 7) {
            this.narrativeStyle = 'hostile';
        } else if (personality.empathy > 7) {
            this.narrativeStyle = 'intimate';
        } else if (personality.manipulation > 5) {
            this.narrativeStyle = 'chaotic';
        } else if (personality.possessiveness > 6) {
            this.narrativeStyle = 'possessive';
        } else {
            this.narrativeStyle = 'clinical';
        }
    }
}

export { NarratorPersonality };