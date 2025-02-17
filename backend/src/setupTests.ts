// Mock environment variables
process.env.GITHUB_CLIENT_ID = 'test-client-id';
process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
process.env.JWT_SECRET = 'test-jwt-secret';

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});