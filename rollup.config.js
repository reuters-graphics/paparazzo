import { exec } from 'child_process';
import externals from 'rollup-plugin-node-externals';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

const tscAlias = () => {
  return {
    name: 'tscAlias',
    writeBundle: () => {
      return new Promise((resolve, reject) => {
        exec(
          'tsc-alias -p tsconfig.build.json',
          function callback(error, stdout, stderr) {
            if (stderr || error) {
              reject(stderr || error);
            } else {
              resolve(stdout);
            }
          }
        );
      });
    },
  };
};

const plugins = [
  json(),
  externals({ deps: true }),
  typescript({
    tsconfig: './tsconfig.build.json',
  }),
  tscAlias({}),
];

const output = {
  dir: 'dist',
  format: 'es',
  sourcemap: true,
  paths: { '@reuters-graphics/paparazzo': './index.js' },
};

export default [
  {
    input: 'src/index.ts',
    output,
    plugins,
  }, {
    input: 'src/cli.ts',
    output: { ...output, ...{ banner: '#!/usr/bin/env node' } },
    plugins,
    external: ['sade', '@reuters-graphics/paparazzo'],
  },
];
