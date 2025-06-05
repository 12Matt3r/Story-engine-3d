// __mocks__/three.js

// This file mocks the 'three' module for Jest tests.
// Only mock the specific parts of THREE that are actually used by the system under test.

export const Raycaster = jest.fn().mockImplementation(() => {
  return {
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn().mockReturnValue([]), // Default to no intersections
  };
});

export const Vector2 = jest.fn().mockImplementation((x = 0, y = 0) => {
  return {
    x: x,
    y: y,
    // Add any methods if Vector2 instances are used with methods in the tested code
  };
});

export const Vector3 = jest.fn().mockImplementation((x = 0, y = 0, z = 0) => {
  return {
    x: x,
    y: y,
    z: z,
    copy: jest.fn().mockReturnThis(), // For chaining or if used
    distanceTo: jest.fn().mockReturnValue(0),
    // Add any other methods if Vector3 instances are used with methods
  };
});

// Mock other THREE components used in the project if they appear in tests:
// (interaction-system.js doesn't directly use these, but other files might in future tests)
export const PerspectiveCamera = jest.fn().mockImplementation(() => {
  return {
    // Mock camera properties/methods if needed
    isPerspectiveCamera: true,
    updateProjectionMatrix: jest.fn(),
  };
});

export const Scene = jest.fn().mockImplementation(() => {
  return {
    // Mock scene properties/methods if needed
    isScene: true,
    add: jest.fn(),
    remove: jest.fn(),
    children: [], // Provide a children array if iterated
    fog: null,
  };
});

export const Mesh = jest.fn().mockImplementation(() => {
  return {
    // Mock mesh properties/methods
    isMesh: true,
    userData: {},
    position: new Vector3(),
    rotation: { x:0, y:0, z:0, set: jest.fn() },
    scale: new Vector3(1,1,1),
    material: { emissive: { setHex: jest.fn() }, emissiveIntensity: 1.0, opacity: 1.0, color: {setHex: jest.fn()} }, // Basic material mock
    geometry: {},
    castShadow: false,
    receiveShadow: false,
  };
});

// Add other necessary mocks as errors indicate they are needed
// For example, if a geometry is instantiated directly from THREE:
// export const BoxGeometry = jest.fn().mockImplementation(() => ({}));
// export const SphereGeometry = jest.fn().mockImplementation(() => ({}));
// export const CylinderGeometry = jest.fn().mockImplementation(() => ({}));
// export const IcosahedronGeometry = jest.fn().mockImplementation(() => ({}));
// export const TorusKnotGeometry = jest.fn().mockImplementation(() => ({}));
// export const PlaneGeometry = jest.fn().mockImplementation(() => ({}));

// export const MeshStandardMaterial = jest.fn().mockImplementation(() => ({
//   color: { setHSL: jest.fn() },
//   emissive: { setHSL: jest.fn() },
// }));
// export const Color = jest.fn().mockImplementation(() => ({
//   setHSL: jest.fn(),
// }));

// If InteractionSystem directly instantiates THREE objects (other than Raycaster, Vector2),
// those would need to be mocked here. For now, it primarily uses instances passed to it or properties.
// The test file interaction-system.test.js already mocks PerspectiveCamera and Scene for its own setup.
// This global mock will catch 'import * as THREE from "three"' in the source file.
