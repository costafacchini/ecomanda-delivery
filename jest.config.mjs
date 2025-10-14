import dotenv from 'dotenv'

dotenv.config()

const jest = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/client/'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(module-alias|isomorphic-fetch)/)'],
  moduleNameMapper: {
    '^\\.jest(.*)$': '<rootDir>/.jest$1',
    '@models(.*)$': '<rootDir>/src/app/models$1',
    '@controllers(.*)$': '<rootDir>/src/app/controllers$1',
    '@routes(.*)$': '<rootDir>/src/app/routes$1',
    '@config(.*)$': '<rootDir>/src/config$1',
    '@queries(.*)$': '<rootDir>/src/app/queries$1',
    '@helpers(.*)$': '<rootDir>/src/app/helpers$1',
    '@reports(.*)$': '<rootDir>/src/app/reports$1',
    '@factories(.*)$': '<rootDir>/src/app/factories$1',
    '@plugins(.*)$': '<rootDir>/src/app/plugins$1',
    '@repositories(.*)$': '<rootDir>/src/app/repositories$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/app/**/*.js',
    '<rootDir>/src/setup/**/*.js',
    '!**/config/**',
    '!<rootDir>/src/app/models/index.js',
    '!<rootDir>/src/app/plugins/storage/S3.js',
    '!<rootDir>/src/app/jobs/*.js',
    '!<rootDir>/src/app/services/Backup.js',
    '!<rootDir>/src/app/services/ClearBackups.js',
  ],
  coverageDirectory: 'coverage',
  setupFiles: ['jest-date-mock'],
  clearMocks: true,
}

export default jest
