import type { Config } from 'jest';

const config: Config = {
 // ✅ Básico
 preset: 'ts-jest',
 testEnvironment: 'node',

 // ✅ ESM Support
 extensionsToTreatAsEsm: ['.ts'],

 // ✅ Paths
 roots: ['<rootDir>/__tests__'],
 testMatch: ['**/*.test.ts'],

 // ✅ Module Mapping (seus aliases)
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
  '^@shared/(.*)$': '<rootDir>/src/shared/$1',
},

 // ✅ Coverage (adaptado para TypeScript)
 collectCoverageFrom: [
  'src/**/*.{ts,js}',  // ✅ TypeScript + JavaScript
  '!src/**/*.d.ts',   // ✅ Ignora tipos
  '!src/server.ts',   // ✅ Ignora entry point
  '!**/node_modules/**',
  '!**/vendor/**',
 ],
 coverageDirectory: 'coverage',
 coverageReporters: ['text', 'lcov', 'html'],

 // ✅ Transform
 transform: {
  '^.+\\.ts$': ['ts-jest', { useESM: true }],
 },

 // ✅ Setup
 setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
 
};

export default config;