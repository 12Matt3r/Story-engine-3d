import { NarrativeTemplates } from './narrative-templates.js';

describe('NarrativeTemplates', () => {
  let templates;

  beforeEach(() => {
    templates = new NarrativeTemplates();
  });

  describe('get(templateName)', () => {
    it('should retrieve a valid template with its properties', () => {
      const beginningTemplate = templates.get('beginning');
      expect(beginningTemplate).toBeDefined();
      expect(beginningTemplate).toHaveProperty('text');
      expect(typeof beginningTemplate.text).toBe('string');
      expect(beginningTemplate).toHaveProperty('effects');
      expect(Array.isArray(beginningTemplate.effects)).toBe(true);
    });

    it('should retrieve a valid template with decisions if applicable', () => {
      const mirrorTemplate = templates.get('mirror');
      expect(mirrorTemplate).toBeDefined();
      expect(mirrorTemplate).toHaveProperty('texts');
      expect(Array.isArray(mirrorTemplate.texts)).toBe(true);
      expect(mirrorTemplate).toHaveProperty('decisions');
      expect(Array.isArray(mirrorTemplate.decisions)).toBe(true);
      if (mirrorTemplate.decisions.length > 0) {
        expect(mirrorTemplate.decisions[0]).toHaveProperty('text');
        expect(mirrorTemplate.decisions[0]).toHaveProperty('consequence');
      }
    });

    it('should return undefined for a non-existent template', () => {
      const nonExistentTemplate = templates.get('nonExistentTemplate123');
      expect(nonExistentTemplate).toBeUndefined();
    });
  });

  describe('applyArchetypeFilter(text, eventType, archetype)', () => {
    const baseText = "This is the base narrative text.";
    const eventType = "some_event"; // eventType is not directly used by the current filter logic

    it('should append Silent Observer flavor text', () => {
      const archetype = 'Silent Observer';
      const filteredText = templates.applyArchetypeFilter(baseText, eventType, archetype);
      expect(filteredText).toBe(baseText + "\n\n*You watch in contemplative silence, understanding more than you reveal.*");
    });

    it('should append Agent of Chaos flavor text', () => {
      const archetype = 'Agent of Chaos';
      const filteredText = templates.applyArchetypeFilter(baseText, eventType, archetype);
      expect(filteredText).toBe(baseText + "\n\n*The very act of your observation seems to destabilize reality around you.*");
    });

    it('should append Emotion Engine flavor text', () => {
      const archetype = 'Emotion Engine';
      const filteredText = templates.applyArchetypeFilter(baseText, eventType, archetype);
      expect(filteredText).toBe(baseText + "\n\n*Waves of emotion ripple out from you, changing the color of the space itself.*");
    });

    it('should append Golden Masked Oracle flavor text', () => {
      const archetype = 'Golden Masked Oracle';
      const filteredText = templates.applyArchetypeFilter(baseText, eventType, archetype);
      expect(filteredText).toBe(baseText + "\n\n*Through your mask, you see the threads of fate that connect this moment to all others.*");
    });

    it('should return original text for an undefined archetype', () => {
      const archetype = undefined;
      const filteredText = templates.applyArchetypeFilter(baseText, eventType, archetype);
      expect(filteredText).toBe(baseText);
    });

    it('should return original text for an unknown archetype', () => {
      const archetype = 'Unknown Archetype';
      const filteredText = templates.applyArchetypeFilter(baseText, eventType, archetype);
      expect(filteredText).toBe(baseText);
    });

    it('should correctly append flavor text to an empty initial text', () => {
      const emptyBaseText = "";
      const archetype = 'Silent Observer';
      const filteredText = templates.applyArchetypeFilter(emptyBaseText, eventType, archetype);
      expect(filteredText).toBe(emptyBaseText + "\n\n*You watch in contemplative silence, understanding more than you reveal.*");
    });
  });
});
