module.exports = {
  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/tests/**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  transformIgnorePatterns: ['node_modules/(?!cheerio)/'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};
