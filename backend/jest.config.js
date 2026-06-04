/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.test.js'],
  collectCoverage: false, // enabled only when running test:coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/db/pool.js',      // excluded: real DB connection, mocked in tests
    '!src/server.js',       // excluded: entry point, tested via supertest
  ],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
    },
  },
};
