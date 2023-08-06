module.exports = {
  preset: '@shelf/jest-mongodb',
  // testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  globalSetup: '<rootDir>/mocks/setup/setup.ts',
  globalTeardown: '<rootDir>/mocks/setup/teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/mocks/setup/setupAfterEnv.ts'],
  testEnvironment: '<rootDir>/mocks/setup/environment.ts',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/api/models/*.{ts,tsx,js,jsx}',
    '!src/api/validation/*.{ts,tsx,js,jsx}',
    '!src/api/routes/problem.*.{ts,tsx,js,jsx}',
    '!src/api/routes/module.*.{ts,tsx,js,jsx}',
    '!src/index.ts',
    '!src/config/*.ts'
  ]
};
