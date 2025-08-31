/**
 * Jest Test Setup
 * 
 * Global test configuration and setup for Jest tests.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_DATABASE = 'energex_test';
process.env.DB_USERNAME = 'root';
process.env.DB_PASSWORD = '';

// Increase timeout for async operations
jest.setTimeout(10000);
