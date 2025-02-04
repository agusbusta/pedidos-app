export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/config/setupAfterEnv.ts'],
  testMatch: [
    '**/__tests__/**/*.test.ts'  // Solo ejecutar archivos que terminen en .test.ts
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/config/',     // Ignorar archivos de configuración
    '/mocks/'       // Ignorar archivos de mock
  ],
  maxWorkers: 1,
  bail: true,
  testTimeout: 5000
}; 