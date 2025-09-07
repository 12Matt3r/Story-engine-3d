import { NARRATIVE_TEMPLATES } from './narrative-data.js';

class NarrativeTemplates {
    constructor() {
        this.templates = NARRATIVE_TEMPLATES;
    }
    
    get(templateName) {
        return this.templates[templateName];
    }
    
    applyArchetypeFilter(text, eventType, archetype) {
        switch (archetype) {
            case 'Silent Observer':
                return text + "\n\n*You watch in contemplative silence, understanding more than you reveal.*";
                
            case 'Agent of Chaos':
                return text + "\n\n*The very act of your observation seems to destabilize reality around you.*";
                
            case 'Emotion Engine':
                return text + "\n\n*Waves of emotion ripple out from you, changing the color of the space itself.*";
                
            case 'Golden Masked Oracle':
                return text + "\n\n*Through your mask, you see the threads of fate that connect this moment to all others.*";
                
            default:
                return text;
        }
    }
}

export { NarrativeTemplates };