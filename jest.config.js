module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/e2e/**/*.test.ts'],
  setupFiles: ['./jest.setup.js'],
};
   