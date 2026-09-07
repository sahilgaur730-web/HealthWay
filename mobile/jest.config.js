/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
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
          rootDir: '.',
          moduleResolution: 'bundler',
          ignoreDeprecations: '6.0',
          types: ['jest', 'node'],
          isolatedModules: true,
        },
      },
    ],
  },
  verbose: true,
};
