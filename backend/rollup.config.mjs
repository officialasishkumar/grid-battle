import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default {
  input: "./src/main.ts",
  output: {
    dir: "build",
    format: "esm",
  },
  external: ["nakama-runtime"],
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript(),
  ],
};
