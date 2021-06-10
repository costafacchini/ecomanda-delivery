require('dotenv').config()

const jest = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^\\.jest(.*)$': '<rootDir>/.jest$1',
    '@models(.*)$': '<rootDir>/src/app/models$1',
    '@controllers(.*)$': '<rootDir>/src/app/controllers$1',
    '@routes(.*)$': '<rootDir>/src/app/routes$1',
    '@config(.*)$': '<rootDir>/src/config$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/app/**/*.js',
    '<rootDir>/src/setup/**/*.js',
    '!**/config/**',
    '!<rootDir>/src/app/models/index.js',
    '!<rootDir>/src/app/jobs/index.js',
  ],
  coverageDirectory: 'coverage',
  clearMocks: true
}

module.exports = jest