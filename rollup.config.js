import executable from "rollup-plugin-executable";
import pkg from "./package.json";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import cleanup from "rollup-plugin-cleanup";

export default {
  input: pkg.module,
  output: {
    file: pkg.main,
    format: "cjs",
    interop: false
  },
  plugins: [
    babel({
      runtimeHelpers: false,
      externalHelpers: true,
      babelrc: false,
      plugins: ["@babel/plugin-proposal-async-generator-functions"],
      exclude: "node_modules/**"
    }),
    resolve(),
    commonjs(),
    cleanup()
  ],
  external: [
    "fs",
    "util",
    "path",
    "os",
    "make-dir",
    "globby",
    "execa",
    "repository-provider"
  ]
};
