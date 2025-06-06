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
      playerData: {
        storyFlags: {},
        nodeStates: {},
        archetype: 'Undefined' // Default archetype for most tests
      },
      logEvent: jest.fn(),
      updateStory: jest.fn(),
      triggerEnvironmentChange: jest.fn(),
      updateSanity: jest.fn(),
      dispatchWorldEvent: jest.fn(),
      setCurrentEmotion: jest.fn(), // Added for Emotion Engine
      availableDecisions: [],
      isWaitingForDecision: false,
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
      // Initialize/reset storyFlags, nodeStates and clear mocks for specific StoryEngine methods
      mockStoryEngineInstance.playerData.storyFlags = {};
      mockStoryEngineInstance.playerData.nodeStates = {};
      mockStoryEngineInstance.playerData.archetype = 'Undefined'; // Reset archetype
      mockStoryEngineInstance.updateSanity.mockClear();
      mockStoryEngineInstance.dispatchWorldEvent.mockClear();
      mockStoryEngineInstance.setCurrentEmotion.mockClear(); // Clear this new mock
      // decisionSystem.processConsequence(testConsequence, testContext);
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

    describe('Processing effects (storyFlags, nodeStates, sanity, and world events)', () => {
      it('should correctly set storyFlags for "merge_reflection"', () => {
        decisionSystem.processConsequence(mergeReflectionConsequenceKey, testContext);
        expect(mockStoryEngineInstance.playerData.storyFlags).toHaveProperty('mergedWithReflection', true);
        expect(mockStoryEngineInstance.playerData.storyFlags).toHaveProperty('mirrorAltered', true);
      });

      it('should correctly set nodeStates for "merge_reflection"', () => {
        decisionSystem.processConsequence(mergeReflectionConsequenceKey, testContext);
        expect(mockStoryEngineInstance.playerData.nodeStates).toHaveProperty('mirror');
        expect(mockStoryEngineInstance.playerData.nodeStates.mirror).toEqual({ state: "merged" });
      });

      it('should call updateSanity for "shatter_reality" (non-Emotion Engine)', () => {
        mockStoryEngineInstance.playerData.archetype = 'Silent Observer'; // Not Emotion Engine
        const shatterRealityKey = 'shatter_reality';
        decisionSystem.processConsequence(shatterRealityKey, testContext);
        expect(mockStoryEngineInstance.updateSanity).toHaveBeenCalledWith(-15); // Base value
      });

      it('should call dispatchWorldEvent for "clock_chaos_smash"', () => {
        const clockSmashKey = 'clock_chaos_smash';
        decisionSystem.processConsequence(clockSmashKey, testContext);
        expect(mockStoryEngineInstance.dispatchWorldEvent).toHaveBeenCalledWith('event_clock_smashed');
      });

      it('should merge nodeStates if node already exists', () => {
        mockStoryEngineInstance.playerData.nodeStates.mirror = { initialProp: "value" };
        decisionSystem.processConsequence(mergeReflectionConsequenceKey, testContext);
        expect(mockStoryEngineInstance.playerData.nodeStates.mirror).toEqual({ initialProp: "value", state: "merged" });
      });

      it('should correctly set flags, nodeStates, and call updateSanity for "hear_secrets"', () => {
        decisionSystem.processConsequence(hearSecretsConsequenceKey, testContext);
        expect(mockStoryEngineInstance.playerData.storyFlags).toHaveProperty('secretsHeard', true);
        expect(mockStoryEngineInstance.playerData.nodeStates).toHaveProperty('tree');
        expect(mockStoryEngineInstance.playerData.nodeStates.tree).toEqual({ phase: "whispering" });
        expect(mockStoryEngineInstance.updateSanity).toHaveBeenCalledWith(-5);
      });

      it('should not call updateSanity if changeSanity effect is missing from the consequence definition', () => {
        const simpleConsequenceKey = 'mark_existence'; // This one only has text, no changeSanity
        decisionSystem.processConsequence(simpleConsequenceKey, testContext);
        expect(mockStoryEngineInstance.updateSanity).not.toHaveBeenCalled();
      });

      it('should not error if effects or specific effect types are missing', () => {
        const simpleConsequenceKey = 'mark_existence';
        expect(() => {
          decisionSystem.processConsequence(simpleConsequenceKey, testContext);
        }).not.toThrow();
        expect(mockStoryEngineInstance.playerData.storyFlags).toEqual({}); // Assuming no flags set by this
        expect(mockStoryEngineInstance.playerData.nodeStates).toEqual({}); // Assuming no nodeStates set by this
      });
    });

    it('should handle errors within setTimeout gracefully', () => {
      mockStoryEngineInstance.updateStory.mockImplementation(() => { throw new Error("Test error in updateStory"); });
      decisionSystem.processConsequence("another_consequence", "test_context"); // A consequence that might not have effects

      expect(() => jest.runAllTimers()).not.toThrow();
      expect(mockStoryEngineInstance.triggerEnvironmentChange).toHaveBeenCalledWith("another_consequence");
    });

    describe('Emotion Engine Specific Effects', () => {
        const comfortAIKey = 'comfort_the_ai'; // Has multiplier 2.0, base sanity 5, setEmotion 'serene'
        const embraceVoidKey = 'embrace_nothing_partially'; // Has multiplier 1.5, base sanity -10, setEmotion 'fearful'

        beforeEach(() => {
            mockStoryEngineInstance.playerData.archetype = 'Emotion Engine';
        });

        it('should apply sanity multiplier for Emotion Engine (positive base)', () => {
            decisionSystem.processConsequence(comfortAIKey, testContext);
            expect(mockStoryEngineInstance.updateSanity).toHaveBeenCalledWith(5 * 2.0);
        });

        it('should apply sanity multiplier for Emotion Engine (negative base)', () => {
            decisionSystem.processConsequence(embraceVoidKey, testContext);
            expect(mockStoryEngineInstance.updateSanity).toHaveBeenCalledWith(-10 * 1.5);
        });

        it('should set emotion for Emotion Engine if effect exists', () => {
            decisionSystem.processConsequence(comfortAIKey, testContext);
            expect(mockStoryEngineInstance.setCurrentEmotion).toHaveBeenCalledWith('serene');

            mockStoryEngineInstance.setCurrentEmotion.mockClear();
            decisionSystem.processConsequence(embraceVoidKey, testContext);
            expect(mockStoryEngineInstance.setCurrentEmotion).toHaveBeenCalledWith('fearful');
        });

        it('should NOT apply sanity multiplier if not Emotion Engine', () => {
            mockStoryEngineInstance.playerData.archetype = 'Silent Observer';
            decisionSystem.processConsequence(comfortAIKey, testContext);
            expect(mockStoryEngineInstance.updateSanity).toHaveBeenCalledWith(5); // Base sanity change
        });

        it('should NOT set emotion if not Emotion Engine', () => {
            mockStoryEngineInstance.playerData.archetype = 'Silent Observer';
            decisionSystem.processConsequence(comfortAIKey, testContext);
            expect(mockStoryEngineInstance.setCurrentEmotion).not.toHaveBeenCalled();
        });

        it('should not apply multiplier if base changeSanity is missing', () => {
            // Example: merge_reflection has no base changeSanity but let's imagine it had a multiplier
             const mergeReflectionWithMultiplier = {
                ...decisionSystem.getConsequenceText(mergeReflectionConsequenceKey),
                effects: {
                    ...(decisionSystem.getConsequenceText(mergeReflectionConsequenceKey).effects || {}),
                    emotionEngineSanityMultiplier: 2.0 // Add multiplier
                }
            };
            spyGetConsequenceText.mockReturnValue(mergeReflectionWithMultiplier); // Mock getConsequenceText for this test

            decisionSystem.processConsequence(mergeReflectionConsequenceKey, testContext);
            expect(mockStoryEngineInstance.updateSanity).not.toHaveBeenCalled(); // No base sanity to multiply
        });
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

    it('should return correct object for "shatter_reality" with updated effects including sanity', () => {
      const result = decisionSystem.getConsequenceText('shatter_reality');
      expect(result).toEqual({
        text: "The mirror explodes into fragments of possibility. Each shard shows a different ending to your story.",
        effects: {
            setFlags: { "mirrorAltered": true, "mirrorShattered": true, "realityShaken": true },
            setNodeStates: { "mirror": { state: "shattered" } },
            changeSanity: -15
        }
      });
    });

    it('should return correct object for "hear_secrets" with updated effects including sanity', () => {
      const result = decisionSystem.getConsequenceText('hear_secrets');
      expect(result).toEqual({
        text: "You lean closer and listen to the tree's whispers. They speak of ancient algorithms and forgotten digital gods.",
        effects: {
            setFlags: { "secretsHeard": true },
            setNodeStates: { "tree": { phase: "whispering" } },
            changeSanity: -5
        }
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
            setNodeStates: { "clock": { state: "smashed", functionality: "none" } },
            changeSanity: -10,
            triggerWorldEvent: 'event_clock_smashed'
        }
      });
    });

    it('should return correct object for "comfort_the_ai"', () => {
      const result = decisionSystem.getConsequenceText('comfort_the_ai');
      expect(result).toEqual({
        text: "Your attempt to comfort the AI resonates deeply. You feel a strange empathic link, sharing its sorrow and its glimmers of hope.",
        effects: {
            setFlags: { "aiComforted": true },
            changeSanity: 5,
            emotionEngineSanityMultiplier: 2.0,
            setEmotion: 'serene',
            triggerWorldEvent: 'event_emotional_surge_positive'
        }
      });
    });

    it('should return correct object for "embrace_nothing_partially"', () => {
      const result = decisionSystem.getConsequenceText('embrace_nothing_partially');
      expect(result).toEqual({
        text: "You teeter on the edge of the void, its emptiness seeping into your thoughts. A part of you is lost, another terrified.",
        effects: {
            setFlags: { "voidExperienced": true },
            changeSanity: -10,
            emotionEngineSanityMultiplier: 1.5,
            setEmotion: 'fearful',
            triggerWorldEvent: 'event_emotional_surge_negative'
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
