import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set test timeout to 10 seconds for integration tests
jest.setTimeout(10000);

// Global teardown after all tests
afterAll(async () => {
  // Add any cleanup needed after integration tests
});