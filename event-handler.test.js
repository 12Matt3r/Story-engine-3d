import { EventHandler } from './event-handler.js';
import { NarrativeTemplates } from './narrative-templates.js'; // Will be the mocked constructor

// Mock NarrativeTemplates
const mockNarrativeTemplatesGet = jest.fn();
const mockApplyArchetypeFilter = jest.fn((text, eventType, archetype) => text); // Default pass-through
jest.mock('./narrative-templates.js', () => {
  return {
    NarrativeTemplates: jest.fn().mockImplementation(() => {
      return {
        get: mockNarrativeTemplatesGet,
        applyArchetypeFilter: mockApplyArchetypeFilter,
      };
    })
  };
});

// Mock StoryEngine (initial simplified structure)
// This will be spread and reset in beforeEach
const baseMockStoryEngine = {
  playerData: {
    archetype: 'Undefined',
    events: [],
  },
  updateStory: jest.fn(),
  logEvent: jest.fn(),
  onDecisionRequired: jest.fn(), // This will be part of the instance
  availableDecisions: [],
  isWaitingForDecision: false,
};

describe('EventHandler', () => {
  let eventHandler;
  let mockStoryEngineInstance;

  // Test templates
  const mockBasicEventTemplate = {
    texts: ["Basic event text."], // Keep as array to test array handling
    effects: ['basic_effect']
  };

  const mockDecisionEventTemplate = {
    texts: ["Decision event text."],
    decisions: [
      { text: "Choose A", consequence: "conA" },
      { text: "Choose B", consequence: "conB" }
    ],
    effects: ['decision_effect']
  };

  const mockMultiTextEventTemplate = {
      texts: ["First text option.", "Second text option.", "Third text option."],
      effects: ['multi_text_effect']
  };


  beforeEach(() => {
    // Clear mocks from previous tests
    mockNarrativeTemplatesGet.mockClear();
    mockApplyArchetypeFilter.mockClear();
    // Reset to default pass-through behavior for filter
    mockApplyArchetypeFilter.mockImplementation((text, eventType, archetype) => text);


    // Create a fresh mock StoryEngine for each test to avoid state leakage
    mockStoryEngineInstance = {
      ...baseMockStoryEngine,
      playerData: { ...baseMockStoryEngine.playerData, events: [] }, // Deep copy playerData
      updateStory: jest.fn(),
      logEvent: jest.fn(),
      onDecisionRequired: jest.fn(), // Callback for decisions
      availableDecisions: [], // Reset this property
      isWaitingForDecision: false, // Reset this property
    };

    eventHandler = new EventHandler(mockStoryEngineInstance);
  });

  describe('Constructor', () => {
    it('should correctly initialize storyEngine and narrativeTemplates', () => {
      expect(eventHandler.storyEngine).toBe(mockStoryEngineInstance);
      expect(eventHandler.narrativeTemplates).toBeDefined(); // Check if it's defined, methods tested via mocks
    });
  });

  describe('triggerEvent(eventType, title)', () => {
    const eventType = 'testEvent';
    const eventTitle = 'Test Event Title';

    describe('Basic Event (No Decisions)', () => {
      beforeEach(() => {
        mockNarrativeTemplatesGet.mockReturnValue(mockBasicEventTemplate);
        eventHandler.triggerEvent(eventType, eventTitle);
      });

      it('should call narrativeTemplates.get with eventType', () => {
        expect(mockNarrativeTemplatesGet).toHaveBeenCalledWith(eventType);
      });

      it('should call narrativeTemplates.applyArchetypeFilter', () => {
        expect(mockApplyArchetypeFilter).toHaveBeenCalledWith(
          mockBasicEventTemplate.texts[0], // texts is an array
          eventType,
          mockStoryEngineInstance.playerData.archetype
        );
      });

      it('should call storyEngine.updateStory with filtered text', () => {
        const expectedText = mockBasicEventTemplate.texts[0]; // as filter is pass-through by default
        expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(expectedText, mockBasicEventTemplate.effects);
      });

      it('should call storyEngine.logEvent with title', () => {
        expect(mockStoryEngineInstance.logEvent).toHaveBeenCalledWith(`Interacted with: ${eventTitle}`, 'event');
      });

      it('should update storyEngine.playerData.events', () => {
        expect(mockStoryEngineInstance.playerData.events).toContain(eventType);
      });

      it('should NOT call showDecisions or storyEngine.onDecisionRequired', () => {
         // showDecisions is internal, so check its effects
        expect(mockStoryEngineInstance.onDecisionRequired).not.toHaveBeenCalled();
        expect(mockStoryEngineInstance.isWaitingForDecision).toBe(false);
      });
    });

    describe('Event With Decisions', () => {
      beforeEach(() => {
        mockNarrativeTemplatesGet.mockReturnValue(mockDecisionEventTemplate);
        eventHandler.triggerEvent(eventType, eventTitle);
      });

      it('should call narrativeTemplates.get', () => {
        expect(mockNarrativeTemplatesGet).toHaveBeenCalledWith(eventType);
      });

      it('should call narrativeTemplates.applyArchetypeFilter', () => {
        expect(mockApplyArchetypeFilter).toHaveBeenCalledWith(
          mockDecisionEventTemplate.texts[0],
          eventType,
          mockStoryEngineInstance.playerData.archetype
        );
      });

      it('should call storyEngine.updateStory', () => {
        expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(mockDecisionEventTemplate.texts[0], mockDecisionEventTemplate.effects);
      });

      it('should call storyEngine.logEvent', () => {
        expect(mockStoryEngineInstance.logEvent).toHaveBeenCalledWith(`Interacted with: ${eventTitle}`, 'event');
      });

      it('should update storyEngine.playerData.events', () => {
        expect(mockStoryEngineInstance.playerData.events).toContain(eventType);
      });

      it('should call storyEngine.onDecisionRequired and set decision state', () => {
        expect(mockStoryEngineInstance.isWaitingForDecision).toBe(true);
        expect(mockStoryEngineInstance.availableDecisions.length).toBe(mockDecisionEventTemplate.decisions.length);
        mockDecisionEventTemplate.decisions.forEach((dec, index) => {
          expect(mockStoryEngineInstance.availableDecisions[index].text).toBe(dec.text);
          expect(mockStoryEngineInstance.availableDecisions[index].consequence).toBe(dec.consequence);
          expect(mockStoryEngineInstance.availableDecisions[index].context).toBe(eventType);
        });
        expect(mockStoryEngineInstance.onDecisionRequired).toHaveBeenCalledWith(mockStoryEngineInstance.availableDecisions);
      });
    });

    describe('Event with Array of Texts', () => {
      let mockMathRandom;

      beforeEach(() => {
        // Mock Math.random to control which text is selected
        mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5); // Will pick the middle element if length is 3 (index 1)
        mockNarrativeTemplatesGet.mockReturnValue(mockMultiTextEventTemplate);
        eventHandler.triggerEvent(eventType, eventTitle);
      });

      afterEach(() => {
        mockMathRandom.mockRestore();
      });

      it('should select one text from the array and apply filter', () => {
        const expectedTextIndex = Math.floor(0.5 * mockMultiTextEventTemplate.texts.length);
        const expectedText = mockMultiTextEventTemplate.texts[expectedTextIndex];

        expect(mockApplyArchetypeFilter).toHaveBeenCalledWith(
            expectedText,
            eventType,
            mockStoryEngineInstance.playerData.archetype
        );
        expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(expectedText, mockMultiTextEventTemplate.effects);
      });
    });

    describe('Non-existent Event Type', () => {
      beforeEach(() => {
        mockNarrativeTemplatesGet.mockReturnValue(undefined); // Simulate event not found
        eventHandler.triggerEvent('nonExistentEvent', 'Non Existent Title');
      });

      it('should exit gracefully without calling storyEngine methods', () => {
        expect(mockStoryEngineInstance.updateStory).not.toHaveBeenCalled();
        expect(mockStoryEngineInstance.logEvent).not.toHaveBeenCalled();
        expect(mockStoryEngineInstance.onDecisionRequired).not.toHaveBeenCalled();
        expect(mockStoryEngineInstance.playerData.events.length).toBe(0);
      });
    });
  });

  describe('updatePlayerState(eventType)', () => {
    it('should push eventType to storyEngine.playerData.events', () => {
      const eventType = 'directStateUpdateEvent';
      eventHandler.updatePlayerState(eventType); // updatePlayerState is called by triggerEvent, here testing directly
      expect(mockStoryEngineInstance.playerData.events).toContain(eventType);
      expect(mockStoryEngineInstance.playerData.events.length).toBe(1);
    });
  });

  describe('Conditional Narrative Elements', () => {
    const treeEventType = 'tree';
    const treeEventTitle = 'The Tree';
    // A base tree template for these tests, can have decisions or not
    const mockTreeTemplate = {
      texts: ["The ancient tree stands before you."],
      decisions: [{ text: "Observe the bark", consequence: "observe_bark" }],
      effects: ['tree_ambience']
    };
     // A template for a non-tree event
    const mockOtherEventTemplate = {
      texts: ["Another unrelated event occurs."],
      effects: ['other_effect']
    };

    beforeEach(() => {
      // Ensure playerData.storyFlags is initialized for each conditional test
      mockStoryEngineInstance.playerData.storyFlags = {};
    });

    it('should modify text and add decision for "tree" event if mirrorAltered flag is true', () => {
      mockStoryEngineInstance.playerData.storyFlags.mirrorAltered = true;
      mockNarrativeTemplatesGet.mockReturnValue(mockTreeTemplate);

      eventHandler.triggerEvent(treeEventType, treeEventTitle);

      const expectedPrependedText = "The tree shimmers with a faint, reflected light. " + mockTreeTemplate.texts[0];
      expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(expectedPrependedText, mockTreeTemplate.effects);

      expect(mockStoryEngineInstance.onDecisionRequired).toHaveBeenCalled();
      const passedDecisions = mockStoryEngineInstance.availableDecisions;
      expect(passedDecisions.length).toBe(mockTreeTemplate.decisions.length + 1);
      expect(passedDecisions).toContainEqual(
        expect.objectContaining({ text: "Touch the shimmering bark", consequence: "tree_mirror_touch", context: treeEventType })
      );
      // Check original decision is still there
      expect(passedDecisions).toContainEqual(
        expect.objectContaining(mockTreeTemplate.decisions[0])
      );
    });

    it('should NOT modify text or decisions for "tree" event if mirrorAltered flag is false', () => {
      mockStoryEngineInstance.playerData.storyFlags.mirrorAltered = false;
      mockNarrativeTemplatesGet.mockReturnValue(mockTreeTemplate);

      eventHandler.triggerEvent(treeEventType, treeEventTitle);

      expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(mockTreeTemplate.texts[0], mockTreeTemplate.effects);

      expect(mockStoryEngineInstance.onDecisionRequired).toHaveBeenCalled();
      const passedDecisions = mockStoryEngineInstance.availableDecisions;
      expect(passedDecisions.length).toBe(mockTreeTemplate.decisions.length);
      expect(passedDecisions).not.toContainEqual(
        expect.objectContaining({ text: "Touch the shimmering bark", consequence: "tree_mirror_touch" })
      );
    });

    it('should NOT modify text or decisions for "tree" event if storyFlags is undefined', () => {
      delete mockStoryEngineInstance.playerData.storyFlags; // Simulate storyFlags not existing
      mockNarrativeTemplatesGet.mockReturnValue(mockTreeTemplate);

      eventHandler.triggerEvent(treeEventType, treeEventTitle);

      expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(mockTreeTemplate.texts[0], mockTreeTemplate.effects);
      const passedDecisions = mockStoryEngineInstance.availableDecisions;
      expect(passedDecisions.length).toBe(mockTreeTemplate.decisions.length);
       expect(passedDecisions).not.toContainEqual(
        expect.objectContaining({ text: "Touch the shimmering bark", consequence: "tree_mirror_touch" })
      );
    });

    it('should NOT modify text or decisions for non-"tree" event even if mirrorAltered flag is true', () => {
      const otherEventType = 'otherEvent';
      mockStoryEngineInstance.playerData.storyFlags.mirrorAltered = true;
      mockNarrativeTemplatesGet.mockReturnValue(mockOtherEventTemplate);

      eventHandler.triggerEvent(otherEventType, 'Other Event Title');

      expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(mockOtherEventTemplate.texts[0], mockOtherEventTemplate.effects);
      // Assuming mockOtherEventTemplate has no decisions by default for this test
      expect(mockStoryEngineInstance.onDecisionRequired).not.toHaveBeenCalled();
    });
  });

  describe('Silent Observer Insights', () => {
    const mirrorEventType = 'mirror';
    const treeEventType = 'tree';
    const otherEventType = 'other_event';

    const mockMirrorTemplate = { texts: ["The mirror reflects."] };
    const mockTreeTemplate = { texts: ["The tree stands tall."] };
    const mockOtherTemplate = { texts: ["Something else happens."] };

    beforeEach(() => {
        // Ensure archetype is reset or explicitly set for each test
        mockStoryEngineInstance.playerData.archetype = 'Undefined';
        // Reset logEvent calls for each test in this suite specifically
        mockStoryEngineInstance.logEvent.mockClear();
    });

    it('should log insight for "mirror" event if archetype is Silent Observer', () => {
      mockStoryEngineInstance.playerData.archetype = 'Silent Observer';
      mockNarrativeTemplatesGet.mockReturnValue(mockMirrorTemplate);
      eventHandler.triggerEvent(mirrorEventType, 'Mirror Event');

      expect(mockStoryEngineInstance.logEvent).toHaveBeenCalledWith(
        "You notice a faint inscription on the mirror's frame, almost invisible to a casual glance. It seems to be a warning.",
        'observer_insight'
      );
    });

    it('should log insight for "tree" event if archetype is Silent Observer', () => {
      mockStoryEngineInstance.playerData.archetype = 'Silent Observer';
      mockNarrativeTemplatesGet.mockReturnValue(mockTreeTemplate);
      eventHandler.triggerEvent(treeEventType, 'Tree Event');

      expect(mockStoryEngineInstance.logEvent).toHaveBeenCalledWith(
        "The shifting binary code on the tree bark occasionally forms patterns resembling ancient star charts.",
        'observer_insight'
      );
    });

    it('should NOT log insight if archetype is NOT Silent Observer', () => {
      mockStoryEngineInstance.playerData.archetype = 'Agent of Chaos';
      mockNarrativeTemplatesGet.mockReturnValue(mockMirrorTemplate);
      eventHandler.triggerEvent(mirrorEventType, 'Mirror Event');

      // Check that logEvent was called for the main event, but not for insight
      expect(mockStoryEngineInstance.logEvent).toHaveBeenCalledWith(`Interacted with: Mirror Event`, 'event');
      expect(mockStoryEngineInstance.logEvent).not.toHaveBeenCalledWith(
        expect.anything(), // Any text
        'observer_insight'
      );
    });

    it('should NOT log insight for non-specified event types even if archetype is Silent Observer', () => {
      mockStoryEngineInstance.playerData.archetype = 'Silent Observer';
      mockNarrativeTemplatesGet.mockReturnValue(mockOtherTemplate);
      eventHandler.triggerEvent(otherEventType, 'Other Event');

      expect(mockStoryEngineInstance.logEvent).toHaveBeenCalledWith(`Interacted with: Other Event`, 'event');
      expect(mockStoryEngineInstance.logEvent).not.toHaveBeenCalledWith(
        expect.anything(),
        'observer_insight'
      );
    });
  });

  describe('Agent of Chaos Conditional Decisions', () => {
    const clockEventType = 'clock';
    const clockEventTitle = 'The Old Clock';

    // Mock template for the clock, including the Agent of Chaos specific decision
    const mockClockTemplate = {
      texts: ["The clock ticks ominously."],
      decisions: [
        { text: "Observe the clock face", consequence: "observe_clock" },
        { text: "Try to wind the clock", consequence: "wind_clock" },
        {
          text: "Smash the clock mechanism with a nearby pipe",
          consequence: "clock_chaos_smash",
          archetypeCondition: 'Agent of Chaos'
        }
      ],
      effects: ['clock_ticking_sound']
    };

    it('should include Agent of Chaos decision for "clock" event if archetype matches', () => {
      mockStoryEngineInstance.playerData.archetype = 'Agent of Chaos';
      mockNarrativeTemplatesGet.mockReturnValue(mockClockTemplate);

      eventHandler.triggerEvent(clockEventType, clockEventTitle);

      expect(mockStoryEngineInstance.onDecisionRequired).toHaveBeenCalled();
      const passedDecisions = mockStoryEngineInstance.availableDecisions;

      // Should have all 3 decisions
      expect(passedDecisions.length).toBe(3);
      expect(passedDecisions).toContainEqual(
        expect.objectContaining({ text: "Smash the clock mechanism with a nearby pipe", consequence: "clock_chaos_smash" })
      );
      expect(passedDecisions).toContainEqual(
        expect.objectContaining({ text: "Observe the clock face", consequence: "observe_clock" })
      );
    });

    it('should NOT include Agent of Chaos decision for "clock" event if archetype does not match', () => {
      mockStoryEngineInstance.playerData.archetype = 'Silent Observer'; // Different archetype
      mockNarrativeTemplatesGet.mockReturnValue(mockClockTemplate);

      eventHandler.triggerEvent(clockEventType, clockEventTitle);

      expect(mockStoryEngineInstance.onDecisionRequired).toHaveBeenCalled();
      const passedDecisions = mockStoryEngineInstance.availableDecisions;

      // Should only have the 2 non-archetype specific decisions
      expect(passedDecisions.length).toBe(2);
      expect(passedDecisions).not.toContainEqual(
        expect.objectContaining({ text: "Smash the clock mechanism with a nearby pipe" })
      );
      expect(passedDecisions).toContainEqual(
        expect.objectContaining({ text: "Observe the clock face" })
      );
      expect(passedDecisions).toContainEqual(
        expect.objectContaining({ text: "Try to wind the clock" })
      );
    });

    it('should handle events with no decisions correctly, even with archetype filtering', () => {
      mockStoryEngineInstance.playerData.archetype = 'Agent of Chaos';
      const noDecisionTemplate = { texts: ["Event with no decisions."] };
      mockNarrativeTemplatesGet.mockReturnValue(noDecisionTemplate);

      eventHandler.triggerEvent('noDecisionTest', "No Decisions Event");

      expect(mockStoryEngineInstance.onDecisionRequired).not.toHaveBeenCalled();
      expect(mockStoryEngineInstance.availableDecisions.length).toBe(0);
    });

    it('should handle events where all decisions are filtered out for an archetype', () => {
      mockStoryEngineInstance.playerData.archetype = 'Silent Observer'; // Not Agent of Chaos
      const chaosOnlyTemplate = {
        texts: ["This event only has a chaos decision."],
        decisions: [
          { text: "Do something chaotic", consequence: "chaos_action", archetypeCondition: 'Agent of Chaos' }
        ]
      };
      mockNarrativeTemplatesGet.mockReturnValue(chaosOnlyTemplate);

      eventHandler.triggerEvent('chaosOnlyEvent', "Chaos Only Event");

      // onDecisionRequired might be called with an empty array if showDecisions is called before checking length > 0
      // Based on current EventHandler: if (currentDecisions.length > 0) { this.showDecisions(...) }
      // So onDecisionRequired should NOT be called if all decisions are filtered out.
      expect(mockStoryEngineInstance.onDecisionRequired).not.toHaveBeenCalled();
      expect(mockStoryEngineInstance.availableDecisions.length).toBe(0);
    });
  });

  describe('Sanity-Based Text Effects', () => {
    const eventType = 'testSanityEvent';
    const eventTitle = 'Sanity Test Event';
    const originalText = "This is a perfectly normal sentence for testing.";
    const mockTemplate = {
        texts: [originalText],
        effects: ['test_effect']
    };
    let mockMathRandom; // Keep this to ensure restoration

    beforeEach(() => {
      mockNarrativeTemplatesGet.mockReturnValue(mockTemplate);
      mockStoryEngineInstance.playerData.sanity = 100;
      mockStoryEngineInstance.updateStory.mockClear();
      // Restore Math.random before each test in this suite to ensure clean state
      if (mockMathRandom && typeof mockMathRandom.mockRestore === 'function') {
        mockMathRandom.mockRestore();
      }
      mockMathRandom = null;
    });

    afterEach(() => {
        if(mockMathRandom && typeof mockMathRandom.mockRestore === 'function') {
            mockMathRandom.mockRestore();
        }
    });

    it('should apply word scramble effect at low sanity when randomEffect < 0.4', () => {
      mockStoryEngineInstance.playerData.sanity = 20; // Low sanity
      // First random call determines effect type, subsequent ones for word scrambling itself
      mockMathRandom = jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.3) // Selects scramble path
        .mockImplementation(() => 0.1); // Subsequent calls for word selection affect many words

      eventHandler.triggerEvent(eventType, eventTitle);

      const MOCK_EXPECT_PREFIX = "[Your thoughts feel scrambled] ";
      const updatedText = mockStoryEngineInstance.updateStory.mock.calls[0][0];
      expect(updatedText.startsWith(MOCK_EXPECT_PREFIX)).toBe(true);
      expect(updatedText.substring(MOCK_EXPECT_PREFIX.length)).not.toBe(originalText);
    });

    it('should append intrusive phrase at low sanity when 0.4 <= randomEffect < 0.7', () => {
      mockStoryEngineInstance.playerData.sanity = 20; // Low sanity
      // First random call for effect type, second for phrase selection
      const unsettlingPhrases = ["...are you sure?", "...it's all unreal...", "...they're watching...", "...can't trust it..."];
      const phraseIndex = 1; // Target unsettlingPhrases[1] ("...it's all unreal...")

      mockMathRandom = jest.spyOn(Math, 'random');
      // 1st call in triggerEvent: for text selection from array (baseTexts.length is 1, so value doesn't matter much)
      mockMathRandom.mockReturnValueOnce(0.1);
      // 2nd call in triggerEvent: for selecting sanity effect type
      mockMathRandom.mockReturnValueOnce(0.5); // 0.5 is >= 0.4 and < 0.7, selects intrusive phrase
      // 3rd call in triggerEvent: for selecting which intrusive phrase
      mockMathRandom.mockReturnValueOnce(phraseIndex / unsettlingPhrases.length); // e.g. 1/4 = 0.25

      eventHandler.triggerEvent(eventType, eventTitle);

      const updatedText = mockStoryEngineInstance.updateStory.mock.calls[0][0];
      expect(updatedText.endsWith(unsettlingPhrases[phraseIndex])).toBe(true);
      expect(updatedText.startsWith(originalText)).toBe(true);
    });

    it('should NOT apply text distortion effects if randomEffect >= 0.7 even at low sanity', () => {
      mockStoryEngineInstance.playerData.sanity = 20; // Low sanity
      mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0.8); // All random calls return 0.8

      eventHandler.triggerEvent(eventType, eventTitle);

      expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(originalText, mockTemplate.effects);
    });

    it('should NOT apply text distortion effects if sanity is high', () => {
      mockStoryEngineInstance.playerData.sanity = 80; // High sanity
      // Math.random could be anything here, effect should not apply

      eventHandler.triggerEvent(eventType, eventTitle);

      expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(originalText, mockTemplate.effects);
    });
  });

  describe('Locked Door Puzzle Logic', () => {
    const lockedDoorEventType = 'locked_door_main';
    const lockedDoorTitle = 'A Heavily Bolted Door';
    const mockUnlockedDoorTemplate = {
      texts: ["The bolts retract with a clang. The way is open."],
      decisions: [{ text: "Step through", consequence: "enter_new_area" }],
      effects: ['door_opens_sound']
    };

    beforeEach(() => {
      // Ensure storyFlags are initialized for each test in this suite
      mockStoryEngineInstance.playerData.storyFlags = {};
      mockNarrativeTemplatesGet.mockReturnValue(mockUnlockedDoorTemplate); // Default to returning the "unlocked" template
    });

    it('should show "locked" message and no decisions if lever_alpha_pulled is false', () => {
      mockStoryEngineInstance.playerData.storyFlags.lever_alpha_pulled = false;
      eventHandler.triggerEvent(lockedDoorEventType, lockedDoorTitle);

      const expectedLockedText = "The massive door is bolted shut. Perhaps a nearby mechanism controls it.";
      expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(expectedLockedText, mockUnlockedDoorTemplate.effects); // Effects might still apply if not cleared
      // Check that decisions are empty or specific "locked" decisions
      expect(mockStoryEngineInstance.availableDecisions).toEqual([]);
      // onDecisionRequired might not be called if currentDecisions is empty and showDecisions checks length
      if (mockStoryEngineInstance.availableDecisions.length === 0) {
        expect(mockStoryEngineInstance.onDecisionRequired).not.toHaveBeenCalled();
      } else {
        expect(mockStoryEngineInstance.onDecisionRequired).toHaveBeenCalledWith([]);
      }
    });

    it('should show "locked" message if storyFlags is undefined', () => {
      delete mockStoryEngineInstance.playerData.storyFlags; // Simulate storyFlags not existing
      eventHandler.triggerEvent(lockedDoorEventType, lockedDoorTitle);

      const expectedLockedText = "The massive door is bolted shut. Perhaps a nearby mechanism controls it.";
      expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(expectedLockedText, mockUnlockedDoorTemplate.effects);
      expect(mockStoryEngineInstance.availableDecisions).toEqual([]);
    });

    it('should show "unlocked" content (from template) if lever_alpha_pulled is true', () => {
      mockStoryEngineInstance.playerData.storyFlags.lever_alpha_pulled = true;
      eventHandler.triggerEvent(lockedDoorEventType, lockedDoorTitle);

      // Expect the text from the template (after archetype filter, which is pass-through here)
      expect(mockStoryEngineInstance.updateStory).toHaveBeenCalledWith(mockUnlockedDoorTemplate.texts[0], mockUnlockedDoorTemplate.effects);
      // Expect decisions from the template
      expect(mockStoryEngineInstance.availableDecisions.length).toBe(mockUnlockedDoorTemplate.decisions.length);
      expect(mockStoryEngineInstance.availableDecisions[0]).toEqual(
        expect.objectContaining(mockUnlockedDoorTemplate.decisions[0])
      );
      expect(mockStoryEngineInstance.onDecisionRequired).toHaveBeenCalledWith(mockStoryEngineInstance.availableDecisions);
    });
  });
});
