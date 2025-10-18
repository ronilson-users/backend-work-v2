/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // ESM Support
  extensionsToTreatAsEsm: ['.ts'],
  
  // Paths
  roots: ['<rootDir>/__test'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Module Mapping (ALIAS PATHS) - ✅ ADICIONAR ESTA PARTE
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@test/(.*)$': '<rootDir>/__test/$1'
  },
  
  // Transform
  transform: {
    '^.+\\.ts$': ['ts-jest', { 
      useESM: true,
      tsconfig: {
        // Garantir que Jest use o mesmo tsconfig
        paths: {
          "@/*": ["./src/*"],
          "@contexts/*": ["./src/contexts/*"],
          "@shared/*": ["./src/shared/*"]
        }
      }
    }],
  },
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/__test/setup.ts'],
  testTimeout: 10000,
};

export default config;