module.exports = {
  testEnvironment: 'node',
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/api/models/*.{ts,tsx,js,jsx}',
    '!src/api/validation/*.{ts,tsx,js,jsx}',
    '!src/api/routes/problem.*.{ts,tsx,js,jsx}',
    '!src/index.ts',
    '!src/config/*.ts'
  ],
};
