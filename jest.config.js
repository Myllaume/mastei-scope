export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: ['plugins/**/*.js', '!plugins/**/*.test.js'],
};
