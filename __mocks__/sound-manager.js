// __mocks__/sound-manager.js

const mockPlaySound = jest.fn();
const mockToggleMute = jest.fn();
const mockSetMasterVolume = jest.fn();

const SoundManager = {
  playSound: mockPlaySound,
  toggleMute: mockToggleMute,
  setMasterVolume: mockSetMasterVolume,
  // Add any other properties or methods that are accessed in your tests or code
  // For example, if you access `SoundManager.muted` or `SoundManager.masterVolume` directly:
  muted: false,
  masterVolume: 0.7,
};

export default SoundManager;
