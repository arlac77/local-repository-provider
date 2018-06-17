import multiEntry from 'rollup-plugin-multi-entry';

export default {
  input: 'tests/**/*-test.js',
  output: {
    file: 'build/bundle-test.js',
    format: 'cjs',
    sourcemap: true,
    interop: false
  },
  external: [
    'ava',
    'fs',
    'util',
    'path',
    'os',
    'make-dir',
    'globby',
    'execa',
    'tempy',
    'repository-provider'
  ],
  plugins: [multiEntry()]
};
