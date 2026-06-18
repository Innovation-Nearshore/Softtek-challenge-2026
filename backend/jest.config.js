'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Backend – Test Report',
        outputPath: 'test-report/index.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
        sort: 'status',
      },
    ],
  ],
};
