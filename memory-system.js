class MemorySystem {
    constructor() {
        this.choicePatterns = new Map();
        this.narratorInteractions = [];
        this.environmentalPreferences = new Map();
        this.storyThemes = new Set();
        this.personalizedContent = [];
    }
    
    recordChoice(context, consequence) {
        this.choicePatterns.set(context, consequence);
    }
    
    getChoicePattern(context) {
        return this.choicePatterns.get(context);
    }
    
    addInteraction(interaction) {
        this.narratorInteractions.push(interaction);
        if (this.narratorInteractions.length > 50) {
            this.narratorInteractions.shift();
        }
    }
    
    addTheme(theme) {
        this.storyThemes.add(theme);
    }
    
    serialize() {
        return {
            choicePatterns: Array.from(this.choicePatterns.entries()),
            environmentalPreferences: Array.from(this.environmentalPreferences.entries()),
            storyThemes: Array.from(this.storyThemes),
            narratorInteractions: this.narratorInteractions.slice(-10)
        };
    }
}

export { MemorySystem };

