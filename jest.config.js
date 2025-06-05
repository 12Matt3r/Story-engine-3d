// jest.config.js
export default {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // If needed later
  testEnvironment: "node", // Or "node" if DOM APIs aren't heavily used in unit tests
   // Support for ES modules
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
};
