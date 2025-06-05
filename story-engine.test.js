import { StoryEngine } from './story-engine.js';

// Mock NarrativeTemplates
const mockNarrativeTemplatesGet = jest.fn();
const mockApplyArchetypeFilter = jest.fn((text, eventType, archetype) => text); // Simple pass-through mock

jest.mock('./narrative-templates.js', () => {
  return {
    NarrativeTemplates: jest.fn().mockImplementation(() => {
      return {
        get: mockNarrativeTemplatesGet,
        applyArchetypeFilter: mockApplyArchetypeFilter, // Assuming StoryEngine might use this
      };
    })
  };
});

describe('StoryEngine', () => {
  let storyEngine;
  let mockOnStoryUpdate;
  let mockOnDecisionRequired;
  let mockOnEnvironmentChange;

  // Mock templates
  const mockBeginningTemplate = {
    text: "Mocked beginning text.",
    effects: ['fade-in']
  };
  const mockEventTemplateWithDecisions = {
    texts: ["Event text with decisions"],
    decisions: [
      { text: "Decision 1", consequence: "consequence_1" },
      { text: "Decision 2", consequence: "consequence_2" }
    ]
  };
  const mockRandomEventText = "A mock random event occurred.";

  beforeEach(() => {
    // Reset mocks for each test
    mockNarrativeTemplatesGet.mockReset();
    mockApplyArchetypeFilter.mockReset();
    mockApplyArchetypeFilter.mockImplementation((text, eventType, archetype) => text); // Reset to simple pass-through


    storyEngine = new StoryEngine();
    mockOnStoryUpdate = jest.fn();
    mockOnDecisionRequired = jest.fn();
    mockOnEnvironmentChange = jest.fn();

    storyEngine.onStoryUpdate = mockOnStoryUpdate;
    storyEngine.onDecisionRequired = mockOnDecisionRequired;
    storyEngine.onEnvironmentChange = mockOnEnvironmentChange;

    // Default mock for 'beginning'
    mockNarrativeTemplatesGet.mockImplementation((templateName) => {
      if (templateName === 'beginning') {
        return mockBeginningTemplate;
      }
      return undefined; // Default for other templates
    });
  });

  describe('Constructor & Initialization', () => {
    it('should initialize playerData with correct default values', () => {
      expect(storyEngine.playerData).toEqual({
        name: 'Unknown',
        archetype: 'Undefined',
        day: 1,
        sanity: 100,
        events: [],
        decisions: [],
        autoplay: false,
        narratorRelationship: 0,
        behaviorProfile: {
          defiant: 0,
          compliant: 0,
          curious: 0,
          destructive: 0,
          empathetic: 0
        },
        storyFlags: {},
        nodeStates: {}
      });
    });

    it('should initialize other properties correctly', () => {
      expect(storyEngine.currentStoryState).toBe('beginning');
      expect(storyEngine.storyLog).toEqual([]);
      expect(storyEngine.availableDecisions).toEqual([]);
      expect(storyEngine.isWaitingForDecision).toBe(false);
      expect(storyEngine.autoPlayEnabled).toBe(false); // Assuming this is the default
    });
  });

  describe('logEvent(content, type)', () => {
    let spyDispatchEvent;
    let originalWindow;
    let originalCustomEvent;

    beforeEach(() => {
      originalWindow = global.window;
      originalCustomEvent = global.CustomEvent;

      global.window = {
        dispatchEvent: jest.fn(() => true)
      };
      spyDispatchEvent = global.window.dispatchEvent;

      global.CustomEvent = jest.fn().mockImplementation((type, detail) => {
        return { type, detail };
      });
    });

    afterEach(() => {
      if (originalWindow) {
        global.window = originalWindow;
      } else {
        delete global.window;
      }
      if (originalCustomEvent) {
        global.CustomEvent = originalCustomEvent;
      } else {
        delete global.CustomEvent;
      }
    });

    it('should add an event to storyLog with correct structure', () => {
      const content = "Test event logged";
      const type = "test_type";
      storyEngine.logEvent(content, type);
      expect(storyEngine.storyLog.length).toBe(1);
      const logEntry = storyEngine.storyLog[0];
      expect(logEntry.content).toBe(content);
      expect(logEntry.type).toBe(type);
      expect(logEntry.day).toBe(storyEngine.playerData.day);
      expect(logEntry.sanity).toBe(storyEngine.playerData.sanity);
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should dispatch a CustomEvent for story-log-update', () => {
      const content = "Another test event";
      const type = "update_type";
      storyEngine.logEvent(content, type);
      expect(spyDispatchEvent).toHaveBeenCalled();
      const eventCall = spyDispatchEvent.mock.calls[0][0];
      // Check properties instead of instanceof for the mocked CustomEvent
      expect(eventCall).toHaveProperty('type', 'story-log-update');
      expect(eventCall).toHaveProperty('detail');
      // eventCall.detail is { detail: logEntry }, so eventCall.detail.detail is logEntry
      expect(eventCall.detail.detail).toBe(storyEngine.storyLog[0]);
    });
  });

  describe('updateStory(text, effects)', () => {
    it('should call onStoryUpdate callback with correct arguments if assigned', () => {
      const text = "Story update text";
      const effects = ['test_effect'];
      storyEngine.updateStory(text, effects);
      expect(mockOnStoryUpdate).toHaveBeenCalledWith({ text, effects });
    });

    it('should not throw an error if onStoryUpdate is null', () => {
      storyEngine.onStoryUpdate = null;
      const text = "Story update text";
      expect(() => storyEngine.updateStory(text, [])).not.toThrow();
    });
  });

  describe('setPlayerArchetype(archetype)', () => {
    let spyLogEvent;

    beforeEach(() => {
      spyLogEvent = jest.spyOn(storyEngine, 'logEvent');
    });

    afterEach(() => {
      spyLogEvent.mockRestore();
    });

    it('should update playerData.archetype', () => {
      const newArchetype = 'Agent of Chaos';
      storyEngine.setPlayerArchetype(newArchetype);
      expect(storyEngine.playerData.archetype).toBe(newArchetype);
    });

    it('should log an event indicating the archetype change', () => {
      const newArchetype = 'Silent Observer';
      storyEngine.setPlayerArchetype(newArchetype);
      expect(spyLogEvent).toHaveBeenCalledWith(`Player archetype set: ${newArchetype}`, 'system');
    });
  });

  describe('beginStory()', () => {
    let spyLogEvent;
    let spyUpdateStory;

    beforeEach(() => {
      spyLogEvent = jest.spyOn(storyEngine, 'logEvent');
      spyUpdateStory = jest.spyOn(storyEngine, 'updateStory');
      // Ensure the mock returns the beginning template for this test suite
      mockNarrativeTemplatesGet.mockImplementation((templateName) => {
        if (templateName === 'beginning') return mockBeginningTemplate;
        return undefined;
      });
    });

    afterEach(() => {
      spyLogEvent.mockRestore();
      spyUpdateStory.mockRestore();
    });

    it('should call narrativeTemplates.get with "beginning"', () => {
      storyEngine.beginStory();
      expect(mockNarrativeTemplatesGet).toHaveBeenCalledWith('beginning');
    });

    it('should call updateStory with text from the beginning template', () => {
      storyEngine.beginStory();
      expect(spyUpdateStory).toHaveBeenCalledWith(mockBeginningTemplate.text, mockBeginningTemplate.effects);
    });

    it('should log "Story begins" event', () => {
      storyEngine.beginStory();
      expect(spyLogEvent).toHaveBeenCalledWith("Story begins", 'narrator');
    });
     it('should call updateStory with default text if template is missing', () => {
      mockNarrativeTemplatesGet.mockReturnValue(undefined); // Simulate missing template
      storyEngine.beginStory();
      expect(spyUpdateStory).toHaveBeenCalledWith("You find yourself in a strange place where stories come to life.", []);
    });
  });

  describe('canAdvance()', () => {
    it('should return true when isWaitingForDecision is false', () => {
      storyEngine.isWaitingForDecision = false;
      expect(storyEngine.canAdvance()).toBe(true);
    });

    it('should return false when isWaitingForDecision is true', () => {
      storyEngine.isWaitingForDecision = true;
      expect(storyEngine.canAdvance()).toBe(false);
    });
  });

  describe('advance()', () => {
    let spyTriggerRandomEvent;

    beforeEach(() => {
      // StoryEngine doesn't directly expose triggerRandomEvent to be spied on easily
      // if it's not a method of the class instance but called internally.
      // For this test, we'll check its observable effects or refactor if needed.
      // For now, let's assume triggerRandomEvent is a method we can spy on.
      // If not, we'd test the conditions and outcomes differently.
      spyTriggerRandomEvent = jest.spyOn(storyEngine, 'triggerRandomEvent').mockImplementation(() => {});
    });

    afterEach(() => {
      spyTriggerRandomEvent.mockRestore();
    });

    it('should call triggerRandomEvent if canAdvance is true', () => {
      storyEngine.isWaitingForDecision = false; // canAdvance will be true
      storyEngine.advance();
      expect(spyTriggerRandomEvent).toHaveBeenCalled();
    });

    it('should not call triggerRandomEvent if canAdvance is false', () => {
      storyEngine.isWaitingForDecision = true; // canAdvance will be false
      storyEngine.advance();
      expect(spyTriggerRandomEvent).not.toHaveBeenCalled();
    });
  });

  describe('triggerRandomEvent()', () => {
    let spyUpdateStory;
    let spyLogEvent;

    beforeEach(() => {
      jest.useFakeTimers();
      spyUpdateStory = jest.spyOn(storyEngine, 'updateStory');
      spyLogEvent = jest.spyOn(storyEngine, 'logEvent');
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
      spyUpdateStory.mockRestore();
      spyLogEvent.mockRestore();
    });

    it('should attempt to call updateStory and logEvent after a delay if not waiting for decision', () => {
      storyEngine.isWaitingForDecision = false;
      storyEngine.triggerRandomEvent(); // This will pick one of the hardcoded random events

      expect(spyUpdateStory).not.toHaveBeenCalled(); // Not called immediately
      expect(spyLogEvent).not.toHaveBeenCalled();   // Not called immediately

      jest.runAllTimers(); // Fast-forward all timers

      expect(spyUpdateStory).toHaveBeenCalled();
      expect(spyUpdateStory.mock.calls[0][0]).toBeDefined(); // Check that some text was passed
      expect(spyUpdateStory.mock.calls[0][1]).toEqual(['glitch']);
      expect(spyLogEvent).toHaveBeenCalled();
      expect(spyLogEvent.mock.calls[0][1]).toBe('random');
    });

    it('should NOT call updateStory or logEvent if isWaitingForDecision is true when timer completes', () => {
      storyEngine.isWaitingForDecision = false; // Initially false
      storyEngine.triggerRandomEvent();

      storyEngine.isWaitingForDecision = true; // Set to true before timers run

      jest.runAllTimers();

      expect(spyUpdateStory).not.toHaveBeenCalled();
      expect(spyLogEvent).not.toHaveBeenCalled();
    });

    it('should handle errors within setTimeout gracefully', () => {
      storyEngine.isWaitingForDecision = false;
      // Sabotage updateStory to throw an error
      spyUpdateStory.mockImplementation(() => { throw new Error("Test error in updateStory"); });

      storyEngine.triggerRandomEvent();

      expect(() => jest.runAllTimers()).not.toThrow(); // The error inside setTimeout should be caught
      // Check console.warn was called (optional, requires more setup or a global spy)
    });
  });

  describe('updateSanity(change)', () => {
    let spyLogEvent;

    beforeEach(() => {
      // Reset sanity to a baseline for each test
      storyEngine.playerData.sanity = 50;
      spyLogEvent = jest.spyOn(storyEngine, 'logEvent');
    });

    afterEach(() => {
        spyLogEvent.mockRestore();
    });

    it('should increase sanity correctly for a positive change', () => {
      storyEngine.updateSanity(10);
      expect(storyEngine.playerData.sanity).toBe(60);
      expect(spyLogEvent).toHaveBeenCalledWith('Sanity changed by +10. Current sanity: 60', 'system_internal');
    });

    it('should decrease sanity correctly for a negative change', () => {
      storyEngine.updateSanity(-10);
      expect(storyEngine.playerData.sanity).toBe(40);
      expect(spyLogEvent).toHaveBeenCalledWith('Sanity changed by -10. Current sanity: 40', 'system_internal');
    });

    it('should clamp sanity at 100 if increase exceeds maximum', () => {
      storyEngine.updateSanity(60); // 50 + 60 = 110, should clamp to 100
      expect(storyEngine.playerData.sanity).toBe(100);
      expect(spyLogEvent).toHaveBeenCalledWith('Sanity changed by +60. Current sanity: 100', 'system_internal');
    });

    it('should maintain sanity at 100 if already at maximum and positive change applied', () => {
      storyEngine.playerData.sanity = 100;
      storyEngine.updateSanity(10);
      expect(storyEngine.playerData.sanity).toBe(100);
      expect(spyLogEvent).toHaveBeenCalledWith('Sanity changed by +10. Current sanity: 100', 'system_internal');
    });

    it('should clamp sanity at 0 if decrease exceeds minimum', () => {
      storyEngine.updateSanity(-60); // 50 - 60 = -10, should clamp to 0
      expect(storyEngine.playerData.sanity).toBe(0);
      expect(spyLogEvent).toHaveBeenCalledWith('Sanity changed by -60. Current sanity: 0', 'system_internal');
    });

    it('should maintain sanity at 0 if already at minimum and negative change applied', () => {
      storyEngine.playerData.sanity = 0;
      storyEngine.updateSanity(-10);
      expect(storyEngine.playerData.sanity).toBe(0);
      expect(spyLogEvent).toHaveBeenCalledWith('Sanity changed by -10. Current sanity: 0', 'system_internal');
    });

    it('should not change sanity if change is not a number', () => {
      storyEngine.updateSanity('invalid');
      expect(storyEngine.playerData.sanity).toBe(50);
      expect(spyLogEvent).not.toHaveBeenCalled();
    });

    it('should not change sanity if change is zero but still log it', () => { // Clarified test name
      storyEngine.updateSanity(0);
      expect(storyEngine.playerData.sanity).toBe(50);
      expect(spyLogEvent).toHaveBeenCalledWith('Sanity changed by 0. Current sanity: 50', 'system_internal'); // Corrected expected log
    });
  });

  describe('updateFlag(flagName, value)', () => {
    let spyLogEvent;

    beforeEach(() => {
      storyEngine.playerData.storyFlags = {}; // Reset flags for each test
      spyLogEvent = jest.spyOn(storyEngine, 'logEvent');
    });

    afterEach(() => {
      spyLogEvent.mockRestore();
    });

    it('should set a new flag to true', () => {
      storyEngine.updateFlag('testFlag1', true);
      expect(storyEngine.playerData.storyFlags.testFlag1).toBe(true);
      expect(spyLogEvent).toHaveBeenCalledWith("Flag 'testFlag1' set to true", 'system_internal');
    });

    it('should set a new flag to false', () => {
      storyEngine.updateFlag('testFlag2', false);
      expect(storyEngine.playerData.storyFlags.testFlag2).toBe(false);
      expect(spyLogEvent).toHaveBeenCalledWith("Flag 'testFlag2' set to false", 'system_internal');
    });

    it('should update an existing flag value', () => {
      storyEngine.playerData.storyFlags.testFlag1 = true;
      storyEngine.updateFlag('testFlag1', false);
      expect(storyEngine.playerData.storyFlags.testFlag1).toBe(false);
      expect(spyLogEvent).toHaveBeenCalledWith("Flag 'testFlag1' set to false", 'system_internal');
    });

    it('should not update flags if flagName is not a string', () => {
      const initialFlags = { ...storyEngine.playerData.storyFlags };
      storyEngine.updateFlag(123, true);
      expect(storyEngine.playerData.storyFlags).toEqual(initialFlags);
      expect(spyLogEvent).not.toHaveBeenCalled();
    });

    it('should allow various types for flag values, logging them correctly', () => {
      storyEngine.updateFlag('countFlag', 10);
      expect(storyEngine.playerData.storyFlags.countFlag).toBe(10);
      expect(spyLogEvent).toHaveBeenCalledWith("Flag 'countFlag' set to 10", 'system_internal');

      spyLogEvent.mockClear(); // Clear mock for next assertion
      storyEngine.updateFlag('stringFlag', "active");
      expect(storyEngine.playerData.storyFlags.stringFlag).toBe("active");
      expect(spyLogEvent).toHaveBeenCalledWith("Flag 'stringFlag' set to active", 'system_internal');
    });
  });

  describe('dispatchWorldEvent(eventName)', () => {
    let spyLogEvent;
    let mockOnWorldEventRequired;

    beforeEach(() => {
      spyLogEvent = jest.spyOn(storyEngine, 'logEvent');
      mockOnWorldEventRequired = jest.fn();
      storyEngine.onWorldEventRequired = mockOnWorldEventRequired;
    });

    afterEach(() => {
      spyLogEvent.mockRestore();
      storyEngine.onWorldEventRequired = null; // Clean up
    });

    it('should call onWorldEventRequired callback with the event name', () => {
      const eventName = 'test_world_event';
      storyEngine.dispatchWorldEvent(eventName);
      expect(mockOnWorldEventRequired).toHaveBeenCalledWith(eventName);
    });

    it('should log the world event dispatch', () => {
      const eventName = 'another_event';
      storyEngine.dispatchWorldEvent(eventName);
      expect(spyLogEvent).toHaveBeenCalledWith(`World event dispatched: ${eventName}`, 'system_internal');
    });

    it('should not call callback or log if onWorldEventRequired is null', () => {
      storyEngine.onWorldEventRequired = null;
      storyEngine.dispatchWorldEvent('event_without_handler');
      expect(spyLogEvent).not.toHaveBeenCalledWith(expect.stringContaining('World event dispatched:'), 'system_internal');
    });

    it('should not call callback or log if eventName is not a string', () => {
      storyEngine.dispatchWorldEvent(123); // Invalid event name
      expect(mockOnWorldEventRequired).not.toHaveBeenCalled();
      expect(spyLogEvent).not.toHaveBeenCalledWith(expect.stringContaining('World event dispatched:'), 'system_internal');
    });
  });
});
