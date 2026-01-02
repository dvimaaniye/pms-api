import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const { compilerOptions } = require('../tsconfig.json');

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/../',
  }),

  transformIgnorePatterns: ['/node_modules/(?!(@faker-js)/)'],

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};

export default config;
