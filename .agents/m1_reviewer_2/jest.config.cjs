const path = require('path');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: path.resolve(__dirname, '../../'),
  roots: [
    path.resolve(__dirname, '../../mobile'),
    path.resolve(__dirname),
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/.agents/m1_reviewer_2/test_suite.ts'],
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
