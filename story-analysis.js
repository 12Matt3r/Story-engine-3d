class StoryAnalysis {
    constructor(storyEngine) {
        this.storyEngine = storyEngine;
    }
    
    exportStory() {
        const storyData = {
            playerName: this.storyEngine.playerData.name,
            archetype: this.storyEngine.playerData.archetype,
            day: this.storyEngine.playerData.day,
            sanity: this.storyEngine.playerData.sanity,
            narratorRelationship: this.storyEngine.playerData.narratorRelationship,
            behaviorProfile: this.storyEngine.playerData.behaviorProfile,
            events: this.storyEngine.playerData.events,
            autoplay: this.storyEngine.playerData.autoplay,
            fullLog: this.storyEngine.storyLog,
            exportTime: new Date().toISOString(),
            ending: this.generateEnding(),
            storyAnalysis: this.generateStoryAnalysis()
        };
        
        return JSON.stringify(storyData, null, 2);
    }
    
    generateEnding() {
        return "Your story comes to an end, shaped by the choices you made and the narrator who watched.";
    }
    
    generateStoryAnalysis() {
        return {
            dominantTrait: this.getDominantBehaviorTrait(),
            narratorRelationshipLevel: this.getNarratorRelationshipLevel(),
            storyComplexity: this.calculateStoryComplexity()
        };
    }
    
    getDominantBehaviorTrait() {
        const behavior = this.storyEngine.playerData.behaviorProfile;
        return Object.entries(behavior)
            .reduce((a, b) => behavior[a[0]] > behavior[b[0]] ? a : b)[0];
    }
    
    getNarratorRelationshipLevel() {
        const relationship = this.storyEngine.playerData.narratorRelationship;
        if (relationship > 70) return 'Beloved Protagonist';
        if (relationship > 40) return 'Trusted Character';
        if (relationship > 10) return 'Interesting Subject';
        if (relationship > -10) return 'Neutral Entity';
        if (relationship > -40) return 'Problematic Element';
        if (relationship > -70) return 'Narrative Disruption';
        return 'Story Virus';
    }
    
    calculateStoryComplexity() {
        const decisions = this.storyEngine.storyLog.filter(entry => entry.type === 'decision').length;
        const consequences = this.storyEngine.storyLog.filter(entry => entry.type === 'consequence').length;
        const randomEvents = this.storyEngine.storyLog.filter(entry => entry.type === 'random').length;
        
        return Math.min(100, (decisions * 3 + consequences * 2 + randomEvents) / 2);
    }
}

export { StoryAnalysis };

