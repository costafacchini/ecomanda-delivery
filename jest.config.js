require('dotenv').config()

const jest = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^\\.jest(.*)$': '<rootDir>/.jest$1',
    '@models(.*)$': '<rootDir>/app/models$1',
    '@controllers(.*)$': '<rootDir>/app/controllers$1',
    '@routes(.*)$': '<rootDir>/app/routes$1',
  }
}

module.exports = jest