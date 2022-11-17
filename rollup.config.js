import less from "rollup-plugin-less";
import nodeResolve from "rollup-plugin-node-resolve";
import localResolve from "rollup-plugin-local-resolve";
import { babel } from "@rollup/plugin-babel";
import image from "@rollup/plugin-image";
import { terser } from "rollup-plugin-terser";

export default {
  input: ["src/client/index.js"],
  output: [
    {
      file: "public/build/build.js",
      compact: false,
      sourcemap: true,
    },
    {
      file: "public/build/build.min.js",
      compact: true,
      sourcemap: false,
      plugins: [terser()],
    },
  ],
  watch: {
    include: "./src/client/**",
  },
  plugins: [
    nodeResolve(),
    localResolve(),
    image(),
    less({
      insert: true,
      output: false,
    }),
    babel({ babelHelpers: "bundled" }),
  ],
};
