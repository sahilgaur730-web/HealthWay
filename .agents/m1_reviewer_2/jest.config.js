/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test_suite.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          moduleResolution: 'node',
          ignoreDeprecations: '6.0',
          types: ['jest', 'node'],
          isolatedModules: true,
        },
      },
    ],
  },
  verbose: true,
};
