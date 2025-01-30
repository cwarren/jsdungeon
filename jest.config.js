// filepath: /test-jest-setup/jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  moduleNameMapper: {
      '^@testing-library/jest-dom/extend-expect$': '<rootDir>/node_modules/@testing-library/jest-dom/dist/extend-expect.js',
  },
  moduleDirectories: ['node_modules'],
};