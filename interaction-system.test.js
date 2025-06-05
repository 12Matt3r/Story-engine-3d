import { InteractionSystem } from './interaction-system.js';
import * as THREE from 'three';

// Mock StoryEngine
const mockStoryEngine = {
  playerData: {},
  logEvent: jest.fn(),
  triggerEvent: jest.fn(),
  canAdvance: jest.fn(),
  advance: jest.fn(),
  updateFlag: jest.fn(), // Added for lever interaction
  // Add any other methods or properties accessed by InteractionSystem
};

// Mock minimal Three.js objects needed
const mockCamera = new THREE.PerspectiveCamera();
const mockScene = new THREE.Scene();

describe('InteractionSystem', () => {
  let interactionSystem;
  let mockRaycaster;

  beforeEach(() => {
    // Reset mocks
    mockStoryEngine.logEvent.mockClear();
    mockStoryEngine.triggerEvent.mockClear();
    mockStoryEngine.canAdvance.mockClear();
    mockStoryEngine.advance.mockClear();
    mockStoryEngine.updateFlag.mockClear(); // Clear this new mock

    // Fresh instance for each test
    interactionSystem = new InteractionSystem(mockScene, mockCamera, mockStoryEngine);

    // Mock Raycaster behavior
    mockRaycaster = {
      setFromCamera: jest.fn(),
      intersectObjects: jest.fn().mockReturnValue([]), // Default to no intersections
    };
    interactionSystem.raycaster = mockRaycaster; // Override the real raycaster
  });

  describe('Constructor', () => {
    it('should initialize correctly', () => {
      expect(interactionSystem.scene).toBe(mockScene);
      expect(interactionSystem.camera).toBe(mockCamera);
      expect(interactionSystem.storyEngine).toBe(mockStoryEngine);
      expect(interactionSystem.raycaster).toBeDefined();
      expect(interactionSystem.interactableObjects).toEqual([]);
    });
  });

  describe('setInteractableObjects', () => {
    it('should update the list of interactable objects', () => {
      const objects = [new THREE.Mesh(), new THREE.Mesh()];
      interactionSystem.setInteractableObjects(objects);
      expect(interactionSystem.interactableObjects).toBe(objects);
    });
  });

  describe('triggerStoryNode', () => {
    let mockNode;
    let mockTextSprite;

    beforeEach(() => {
      mockTextSprite = {
        material: {
          color: { setHex: jest.fn() },
          // Add other material properties if InteractionSystem modifies them
        }
      };
      mockNode = {
        userData: {
          type: 'storyNode',
          storyType: 'test_story',
          title: 'Test Node',
          triggered: false,
          textSprite: mockTextSprite,
        },
        material: {
          emissive: { setHex: jest.fn() }
        }
      };
      jest.useFakeTimers(); // For setTimeout in sprite glitch effect
      interactionSystem.triggerStoryNode(mockNode);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('should set node as triggered', () => {
      expect(mockNode.userData.triggered).toBe(true);
    });

    it('should set node material emissive color', () => {
      expect(mockNode.material.emissive.setHex).toHaveBeenCalledWith(0x333333);
    });

    it('should trigger story event via storyEngine', () => {
      expect(mockStoryEngine.triggerEvent).toHaveBeenCalledWith('test_story', 'Test Node');
    });

    it('should apply glitch effect to text sprite', () => {
      expect(mockTextSprite.material.color.setHex).toHaveBeenCalledWith(0xff0000);
      jest.runAllTimers();
      expect(mockTextSprite.material.color.setHex).toHaveBeenCalledWith(0xffffff);
    });

    it('should handle text sprite without material gracefully', () => {
        mockNode.userData.textSprite = { ...mockTextSprite, material: undefined };
        expect(() => interactionSystem.triggerStoryNode(mockNode)).not.toThrow();
    });
  });

  describe('triggerLoreFragment', () => {
    let mockFragmentNode;

    beforeEach(() => {
      mockFragmentNode = {
        userData: {
          type: 'lore_fragment',
          title: "Ancient Lore",
          loreText: "This is a piece of ancient wisdom.",
          triggered: false,
        },
        material: {
          emissive: { value: 0xff0000 }, // Example starting value
          emissiveIntensity: 1.0,
          opacity: 1.0,
          clone: function() { return this; } // Simple clone for this test
        }
      };
      // Spy on material for property changes
      jest.spyOn(mockFragmentNode.material, 'clone');
    });

    it('should set fragment as triggered', () => {
      interactionSystem.triggerLoreFragment(mockFragmentNode);
      expect(mockFragmentNode.userData.triggered).toBe(true);
    });

    it('should log lore discovery via storyEngine', () => {
      interactionSystem.triggerLoreFragment(mockFragmentNode);
      const expectedLogText = `${mockFragmentNode.userData.title}: ${mockFragmentNode.userData.loreText}`;
      expect(mockStoryEngine.logEvent).toHaveBeenCalledWith(expectedLogText, 'lore_discovery');
    });

    it('should reduce emissiveIntensity if material has emissive property', () => {
      interactionSystem.triggerLoreFragment(mockFragmentNode);
      expect(mockFragmentNode.material.emissiveIntensity).toBe(Math.max(0.1, 1.0 * 0.2));
    });

    it('should reduce opacity if material has no emissive but has opacity', () => {
      delete mockFragmentNode.material.emissive; // Remove emissive for this test case
      mockFragmentNode.material.opacity = 0.8; // Set an initial opacity
      Object.defineProperty(mockFragmentNode.material, 'hasOwnProperty', { value: (prop) => prop === 'opacity' });


      interactionSystem.triggerLoreFragment(mockFragmentNode);
      expect(mockFragmentNode.material.opacity).toBe(0.8 * 0.5);
      expect(mockFragmentNode.material.transparent).toBe(true);
    });

    it('should handle fragment node without material gracefully', () => {
        const nodeWithoutMaterial = { ...mockFragmentNode, material: undefined };
        expect(() => interactionSystem.triggerLoreFragment(nodeWithoutMaterial)).not.toThrow();
    });
  });

  describe('triggerLever', () => {
    let mockLeverNode;
    let mockLeverHandle;

    beforeEach(() => {
      mockLeverHandle = {
        rotation: { x: Math.PI / 4 } // Initial 'off' angle
      };
      mockLeverNode = {
        userData: {
          type: 'lever',
          id: 'lever_alpha',
          triggered: false, // Initial state: off
        },
        children: [{}, mockLeverHandle] // Mock base and handle
      };
    });

    it('should toggle userData.triggered state', () => {
      interactionSystem.triggerLever(mockLeverNode);
      expect(mockLeverNode.userData.triggered).toBe(true); // Now on
      interactionSystem.triggerLever(mockLeverNode);
      expect(mockLeverNode.userData.triggered).toBe(false); // Now off
    });

    it('should update handle rotation based on triggered state', () => {
      // Trigger once (to on)
      interactionSystem.triggerLever(mockLeverNode);
      expect(mockLeverHandle.rotation.x).toBe(-Math.PI / 4);

      // Trigger again (to off)
      interactionSystem.triggerLever(mockLeverNode);
      expect(mockLeverHandle.rotation.x).toBe(Math.PI / 4);
    });

    it('should call storyEngine.updateFlag with correct parameters', () => {
      interactionSystem.triggerLever(mockLeverNode); // off -> on
      expect(mockStoryEngine.updateFlag).toHaveBeenCalledWith('lever_alpha_pulled', true);

      mockStoryEngine.updateFlag.mockClear(); // Clear for next call
      interactionSystem.triggerLever(mockLeverNode); // on -> off
      expect(mockStoryEngine.updateFlag).toHaveBeenCalledWith('lever_alpha_pulled', false);
    });

    it('should log the lever interaction', () => {
      interactionSystem.triggerLever(mockLeverNode); // off -> on
      expect(mockStoryEngine.logEvent).toHaveBeenCalledWith('Lever lever_alpha activated', 'interaction');

      mockStoryEngine.logEvent.mockClear();
      interactionSystem.triggerLever(mockLeverNode); // on -> off
      expect(mockStoryEngine.logEvent).toHaveBeenCalledWith('Lever lever_alpha deactivated', 'interaction');
    });

    it('should handle lever node without children gracefully', () => {
        const leverNoChildren = { ...mockLeverNode, children: [] };
        expect(() => interactionSystem.triggerLever(leverNoChildren)).not.toThrow();
    });

    it('should handle lever node without userData.id gracefully for logging', () => {
        const leverNoId = { ...mockLeverNode, userData: { ...mockLeverNode.userData, id: undefined } };
        interactionSystem.triggerLever(leverNoId);
        expect(mockStoryEngine.logEvent).toHaveBeenCalledWith('Lever  activated', 'interaction');
    });
  });

  describe('handleInteraction', () => {
    let mockStoryNode;
    let mockLoreFragment;
    let mockLever;

    beforeEach(() => {
      mockStoryNode = {
        userData: { type: 'storyNode', triggered: false, storyType: 'type1', title: 'Node1' },
        material: { emissive: { setHex: jest.fn() } },
      };
      mockLoreFragment = {
        userData: { type: 'lore_fragment', triggered: false, title: 'Lore1', loreText: 'Text1' },
        material: { emissiveIntensity: 1.0, clone: function() { return this; } },
      };
      mockLever = { // Mock for the lever
        userData: { type: 'lever', id: 'lever_alpha', triggered: false },
        children: [{}, { rotation: { x: 0 } }] // Mock base and handle with rotation
      };
      interactionSystem.setInteractableObjects([mockStoryNode, mockLoreFragment, mockLever]);

      // Spy on the methods that would be called
      jest.spyOn(interactionSystem, 'triggerStoryNode').mockImplementation(() => {});
      jest.spyOn(interactionSystem, 'triggerLoreFragment').mockImplementation(() => {});
      jest.spyOn(interactionSystem, 'triggerLever').mockImplementation(() => {});
    });

    afterEach(() => {
        interactionSystem.triggerStoryNode.mockRestore();
        interactionSystem.triggerLoreFragment.mockRestore();
        interactionSystem.triggerLever.mockRestore();
    });

    it('should call triggerStoryNode for an untriggered storyNode', () => {
      mockRaycaster.intersectObjects.mockReturnValue([{ object: mockStoryNode }]);
      const result = interactionSystem.handleInteraction();
      expect(interactionSystem.raycaster.intersectObjects).toHaveBeenCalledWith([mockStoryNode, mockLoreFragment, mockLever]);
      expect(interactionSystem.triggerStoryNode).toHaveBeenCalledWith(mockStoryNode);
      expect(result).toBe(mockStoryNode);
    });

    it('should call triggerLoreFragment for an untriggered lore_fragment', () => {
      mockRaycaster.intersectObjects.mockReturnValue([{ object: mockLoreFragment }]);
      const result = interactionSystem.handleInteraction();
      expect(interactionSystem.triggerLoreFragment).toHaveBeenCalledWith(mockLoreFragment);
      expect(result).toBe(mockLoreFragment);
    });

    it('should call triggerLever for a lever', () => {
      mockRaycaster.intersectObjects.mockReturnValue([{ object: mockLever }]);
      const result = interactionSystem.handleInteraction();
      expect(interactionSystem.triggerLever).toHaveBeenCalledWith(mockLever);
      expect(result).toBe(mockLever);
    });

    it('should do nothing if storyNode is already triggered', () => {
      mockStoryNode.userData.triggered = true;
      mockRaycaster.intersectObjects.mockReturnValue([{ object: mockStoryNode }]);
      const result = interactionSystem.handleInteraction();
      expect(interactionSystem.triggerStoryNode).not.toHaveBeenCalled();
      expect(result).toBeNull(); // Or expect it to return the object if that's the design
    });

    it('should do nothing if lore_fragment is already triggered', () => {
      mockLoreFragment.userData.triggered = true;
      mockRaycaster.intersectObjects.mockReturnValue([{ object: mockLoreFragment }]);
      const result = interactionSystem.handleInteraction();
      expect(interactionSystem.triggerLoreFragment).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if no interactable object is intersected', () => {
      mockRaycaster.intersectObjects.mockReturnValue([]); // No intersections
      const result = interactionSystem.handleInteraction();
      expect(interactionSystem.triggerStoryNode).not.toHaveBeenCalled();
      expect(interactionSystem.triggerLoreFragment).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null for an object of unknown type', () => {
        const unknownObject = { userData: { type: 'unknown', triggered: false } };
        interactionSystem.setInteractableObjects([unknownObject]);
        mockRaycaster.intersectObjects.mockReturnValue([{ object: unknownObject }]);
        const result = interactionSystem.handleInteraction();
        expect(result).toBeNull();
    });
  });

  describe('advanceStory', () => {
    it('should call storyEngine.advance if storyEngine.canAdvance returns true', () => {
      mockStoryEngine.canAdvance.mockReturnValue(true);
      interactionSystem.advanceStory();
      expect(mockStoryEngine.advance).toHaveBeenCalled();
    });

    it('should NOT call storyEngine.advance if storyEngine.canAdvance returns false', () => {
      mockStoryEngine.canAdvance.mockReturnValue(false);
      interactionSystem.advanceStory();
      expect(mockStoryEngine.advance).not.toHaveBeenCalled();
    });
  });
});
