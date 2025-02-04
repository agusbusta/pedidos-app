import baseConfig from './jest.config';

export default {
  ...baseConfig,
  testMatch: ['**/__tests__/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/config/setup.ts']
}; 