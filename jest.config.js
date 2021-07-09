require('dotenv').config()

const jest = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/client/'],
  moduleNameMapper: {
    '^\\.jest(.*)$': '<rootDir>/.jest$1',
    '@models(.*)$': '<rootDir>/src/app/models$1',
    '@controllers(.*)$': '<rootDir>/src/app/controllers$1',
    '@routes(.*)$': '<rootDir>/src/app/routes$1',
    '@config(.*)$': '<rootDir>/src/config$1',
    '@queries(.*)$': '<rootDir>/src/app/queries$1',
    '@reports(.*)$': '<rootDir>/src/app/reports$1',
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
  clearMocks: true,
}

module.exports = jest
