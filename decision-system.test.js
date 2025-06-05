import { DecisionSystem } from './decision-system.js';

// Mock StoryEngine (simplified for DecisionSystem's needs)
const baseMockStoryEngine = {
  playerData: {}, // Will be reset in beforeEach
  logEvent: jest.fn(),
  updateStory: jest.fn(),
  triggerEnvironmentChange: jest.fn(),
  availableDecisions: [],
  isWaitingForDecision: false,
};

describe('DecisionSystem', () => {
  let decisionSystem;
  let mockStoryEngineInstance;

  beforeEach(() => {
    // Create a fresh mock StoryEngine for each test
    mockStoryEngineInstance = {
      ...baseMockStoryEngine,
      playerData: {}, // Reset playerData
      logEvent: jest.fn(),
      updateStory: jest.fn(),
      triggerEnvironmentChange: jest.fn(),
      availableDecisions: [], // Reset availableDecisions
      isWaitingForDecision: false, // Reset isWaitingForDecision
    };

    decisionSystem = new DecisionSystem(mockStoryEngineInstance);
  });

  describe('Constructor', () => {
    it('should correctly initialize storyEngine', () => {
      expect(decisionSystem.storyEngine).toBe(mockStoryEngineInstance);
    });
  });

  describe('makeDecision(decisionIndex)', () => {
    let spyProcessConsequence;

    beforeEach(() => {
      spyProcessConsequence = jest.spyOn(decisionSystem, 'processConsequence');
    });

    afterEach(() => {
      spyProcessConsequence.mockRestore();
    });

    describe('Valid Decision', () => {
      const mockDecision = { text: "Test Decision", consequence: "test_consequence", context: "test_context" };
      const decisionIndex = 0;

      beforeEach(() => {
        mockStoryEngineInstance.isWaitingForDecision = true;
        mockStoryEngineInstance.availableDecisions = [mockDecision];
        decisionSystem.makeDecision(decisionIndex);
      });

      it('should log the chosen decision', () => {
        expect(mockStoryEngineInstance.logEvent).toHaveBeenCalledWith(`Chose: ${mockDecision.text}`, 'decision');
      });

      it('should call processConsequence with the correct consequence and context', () => {
        expect(spyProcessConsequence).toHaveBeenCalledWith(mockDecision.consequence, mockDecision.context);
      });

      it('should set isWaitingForDecision to false', () => {
        expect(mockStoryEngineInstance.isWaitingForDecision).toBe(false);
      });

      it('should clear availableDecisions', () => {
        expect(mockStoryEngineInstance.availableDecisions).toEqual([]);
      });
    });

    describe('Invalid State (Not Waiting for Decision)', () => {
      beforeEach(() => {
        mockStoryEngineInstance.isWaitingForDecision = false;
        mockStoryEngineInstance.availableDecisions = [{ text: "Test", consequence: "test_con", context: "ctx" }]; // Has decisions
        decisionSystem.makeDecision(0);
      });

      it('should NOT log an event', () => {
        expect(mockStoryEngineInstance.logEvent).not.toHaveBeenCalled();
      });

      it('should NOT call processConsequence', () => {
        expect(spyProcessConsequence).not.toHaveBeenCalled();
      });
    });

    describe('Invalid Decision Index', () => {
      beforeEach(() => {
        mockStoryEngineInstance.isWaitingForDecision = true;
        mockStoryEngineInstance.availableDecisions = [{ text: "Test", consequence: "test_con", context: "ctx" }];
      });

      it('should NOT log or process if index is out of bounds (too high)', () => {
        decisionSystem.makeDecision(1); // Index 1 is out of bounds
        expect(mockStoryEngineInstance.logEvent).not.toHaveBeenCalled();
        expect(spyProcessConsequence).not.toHaveBeenCalled();
      });

      it('should NOT log or process if index is out of bounds (negative)', () => {
        decisionSystem.makeDecision(-1); // Index -1 is out of bounds
        expect(mockStoryEngineInstance.logEvent).not.toHaveBeenCalled();
        expect(spyProcessConsequence).not.toHaveBeenCalled();
      });

      it('should NOT log or process if availableDecisions is empty', () => {
        mockStoryEngineInstance.availableDecisions = [];
        decisionSystem.makeDecision(0);
        expect(mockStoryEngineInstance.logEvent).not.toHaveBeenCalled();
        expect(spyProcessConsequence).not.toHaveBeenCalled();
      });
    });
  });

  describe('processConsequence(consequence, context)', () => {
    const testConsequence = 'merge_reflection'; // A known consequence
    const testContext = 'mirror_event';
    let spyGetConsequenceText;
    const mergeReflectionConsequenceKey = 'merge_reflection';
    const hearSecretsConsequenceKey = 'hear_secrets';


    beforeEach(() => {
      jest.useFakeTimers();
      spyGetConsequenceText = jest.spyOn(decisionSystem, 'getConsequenceText');
      // Initialize storyFlags and nodeStates for these tests
      mockStoryEngineInstance.playerData.storyFlags = {};
      mockStoryEngineInstance.playerData.nodeStates = {};
      // decisionSystem.processConsequence(testConsequence, testContext); // Call this within each test or describe block
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
      spyGetConsequenceText.mockRestore();
    });

    // This test was outside the block where processConsequence was called.
    // Moved the call into this test, or it could be part of the nested describe.
    it('should call getConsequenceText with the consequence when processConsequence is invoked', () => {
      decisionSystem.processConsequence(testConsequence, testContext); // Call it here
      expect(spyGetConsequenceText).toHaveBeenCalledWith(testConsequence);
    });

    describe('Processing text and environment change', () => {
      beforeEach(() => {
        decisionSystem.processConsequence(testConsequence, testContext);
      });

      // This assertion is now redundant due to the one above, but harmless if it stays
      // or can be removed if the above is considered sufficient.
      // For now, let's keep it to ensure it's also covered in this specific block's setup.
      it('should call getConsequenceText with the consequence (within nested describe)', () => {
        expect(spyGetConsequenceText).toHaveBeenCalledWith(testConsequence);
      });

      it('should call storyEngine.updateStory with consequence text after timeout', () => {
        expect(mockStoryEngineInstance.updateStory).not.toHaveBeenCalled(); // Not immediately
        jest.runAllTimers();
        const expectedConsequenceObject = decisionSystem.getConsequenceText(testConsequence);
        expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(expectedConsequenceObject.text, ['fade-in']);
      });

      it('should log the consequence text after timeout', () => {
        expect(mockStoryEngineInstance.logEvent).not.toHaveBeenCalled(); // Not immediately
        jest.runAllTimers();
        const expectedConsequenceObject = decisionSystem.getConsequenceText(testConsequence);
        expect(mockStoryEngineInstance.logEvent).toHaveBeenCalledWith(expectedConsequenceObject.text, 'consequence');
      });

      it('should call storyEngine.triggerEnvironmentChange with the consequence', () => {
        expect(mockStoryEngineInstance.triggerEnvironmentChange).toHaveBeenCalledWith(testConsequence);
      });
    });

    describe('Processing effects (storyFlags and nodeStates)', () => {
      it('should correctly set storyFlags based on consequence effects', () => {
        decisionSystem.processConsequence(mergeReflectionConsequenceKey, testContext);
        expect(mockStoryEngineInstance.playerData.storyFlags).toHaveProperty('mergedWithReflection', true);
        expect(mockStoryEngineInstance.playerData.storyFlags).toHaveProperty('mirrorAltered', true);
      });

      it('should correctly set nodeStates based on consequence effects', () => {
        decisionSystem.processConsequence(mergeReflectionConsequenceKey, testContext);
        expect(mockStoryEngineInstance.playerData.nodeStates).toHaveProperty('mirror');
        expect(mockStoryEngineInstance.playerData.nodeStates.mirror).toEqual({ state: "merged" });
      });

      it('should merge nodeStates if node already exists', () => {
        mockStoryEngineInstance.playerData.nodeStates.mirror = { initialProp: "value" };
        decisionSystem.processConsequence(mergeReflectionConsequenceKey, testContext);
        expect(mockStoryEngineInstance.playerData.nodeStates.mirror).toEqual({ initialProp: "value", state: "merged" });
      });

      it('should correctly set flags and nodeStates for another event (hear_secrets)', () => {
        decisionSystem.processConsequence(hearSecretsConsequenceKey, testContext);
        expect(mockStoryEngineInstance.playerData.storyFlags).toHaveProperty('secretsHeard', true);
        expect(mockStoryEngineInstance.playerData.nodeStates).toHaveProperty('tree');
        expect(mockStoryEngineInstance.playerData.nodeStates.tree).toEqual({ phase: "whispering" });
      });

      it('should not error if effects or specific effect types are missing', () => {
        const simpleConsequenceKey = 'mark_existence'; // This one only has text
        expect(() => {
          decisionSystem.processConsequence(simpleConsequenceKey, testContext);
        }).not.toThrow();
        expect(mockStoryEngineInstance.playerData.storyFlags).toEqual({});
        expect(mockStoryEngineInstance.playerData.nodeStates).toEqual({});
      });
    });

    it('should handle errors within setTimeout gracefully', () => {
      mockStoryEngineInstance.updateStory.mockImplementation(() => { throw new Error("Test error in updateStory"); });
      decisionSystem.processConsequence("another_consequence", "test_context"); // A consequence that might not have effects

      expect(() => jest.runAllTimers()).not.toThrow();
      expect(mockStoryEngineInstance.triggerEnvironmentChange).toHaveBeenCalledWith("another_consequence");
    });
  });

  describe('getConsequenceText(consequence)', () => {
    it('should return correct object for a known consequence with effects (merge_reflection)', () => {
      const result = decisionSystem.getConsequenceText('merge_reflection');
      expect(result).toEqual({
        text: "You merge with your reflection. Reality becomes a hall of mirrors where every choice echoes infinitely.",
        effects: {
            setFlags: { "mergedWithReflection": true, "mirrorAltered": true },
            setNodeStates: { "mirror": { state: "merged" } }
        }
      });
    });

    it('should return correct object for "shatter_reality" with updated effects', () => {
      const result = decisionSystem.getConsequenceText('shatter_reality');
      expect(result).toEqual({
        text: "The mirror explodes into fragments of possibility. Each shard shows a different ending to your story.",
        effects: { setFlags: { "mirrorAltered": true, "mirrorShattered": true, "realityShaken": true }, setNodeStates: { "mirror": { state: "shattered" } } }
      });
    });

    it('should return correct object for another known consequence with effects (hear_secrets)', () => {
      const result = decisionSystem.getConsequenceText('hear_secrets');
      expect(result).toEqual({
        text: "You lean closer and listen to the tree's whispers. They speak of ancient algorithms and forgotten digital gods.",
        effects: { setFlags: { "secretsHeard": true }, setNodeStates: { "tree": { phase: "whispering" } } }
      });
    });

    it('should return correct object for the new "tree_mirror_touch" consequence', () => {
      const result = decisionSystem.getConsequenceText('tree_mirror_touch');
      expect(result).toEqual({
        text: "As you touch the shimmering bark, a jolt of static energy flows through you. The tree's whispers momentarily align with the fragmented visions from the mirror, speaking of interconnected realities.",
        effects: {
            setFlags: { "treeRespondedToMirror": true, "interconnectedVision": true },
            setNodeStates: { "tree": { phase: "mirror_resonant" } }
        }
      });
    });

    it('should return correct object for the new "clock_chaos_smash" consequence', () => {
      const result = decisionSystem.getConsequenceText('clock_chaos_smash');
      expect(result).toEqual({
        text: "You grab a loose pipe and gleefully smash the clock's intricate mechanism. Gears fly, springs uncoil violently, and time itself seems to stutter and warp around you. The Narrator sighs audibly.",
        effects: {
            setFlags: { "clockDestroyed": true, "narratorAnnoyed": true, "chaosIncreased": true },
            setNodeStates: { "clock": { state: "smashed", functionality: "none" } }
        }
      });
    });

    it('should return object with only text for consequence without effects (mark_existence)', () => {
      const result = decisionSystem.getConsequenceText('mark_existence');
      expect(result).toEqual({
        text: "You carve your name into the tree's bark. The binary code flows around your inscription, incorporating it into its digital DNA."
        // No 'effects' property expected here
      });
       expect(result.effects).toBeUndefined();
    });

    it('should return default text object for an unknown consequence', () => {
      const result = decisionSystem.getConsequenceText('unknown_mystery_consequence_xyz');
      expect(result).toEqual({
        text: "Something unexpected happens. The story continues to write itself."
      });
    });

    it('should return default text object for a null consequence', () => {
      const result = decisionSystem.getConsequenceText(null);
      expect(result).toEqual({
        text: "Something unexpected happens. The story continues to write itself."
      });
    });

    it('should return default text object for an undefined consequence', () => {
      const result = decisionSystem.getConsequenceText(undefined);
      expect(result).toEqual({
        text: "Something unexpected happens. The story continues to write itself."
      });
    });
  });
});
