'use strict';

// https://github.com/mochajs/mocha-examples/tree/master/packages/typescript-babel
const config = {
  diff: true,
  extension: ['js', 'ts'],
  package: './package.json',
  reporter: 'spec',
  slow: 75,
  timeout: 2000,
  ui: 'bdd',
  require: 'test/babel-register.js',
  'watch-files': ['src/**/*.ts', 'test/**/*.js']
};

const M = process.env.M;

/**
 * @example:
 * M=ObjectType npm run tdd
 */
if (M) {
  config.spec = 'test/' + M + 'Spec.js';
}

module.exports = config;
