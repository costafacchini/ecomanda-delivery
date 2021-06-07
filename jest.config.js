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
  collectCoverageFrom: [
    '<rootDir>/src/app/**/*.js',
    '<rootDir>/src/setup/**/*.js',
    '!**/config/**'
  ],
  clearMocks: true
}

module.exports = jest