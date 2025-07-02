/** @type {import('jest').Config} */
module.exports = {
  projects: [
    '<rootDir>/apps/web/jest.config.js',
    '<rootDir>/packages/server/jest.config.js',
    '<rootDir>/packages/shared/jest.config.js',
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.turbo/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
};