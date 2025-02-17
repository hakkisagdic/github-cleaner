const config = require('./jest.config');

module.exports = {
  ...config,
  testMatch: ['**/__tests__/**/*.integration.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/setupIntegrationTests.ts']
};