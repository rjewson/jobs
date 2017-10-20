// import resolve from "rollup-plugin-node-resolve";
// import babel from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: {
    file: "dist/jobs.js",
    format: "cjs",
    sourcemap: 'inline'
  },
  watch: {
    include: "src/**"
  }
  // ,
  // plugins: [
  //   resolve(),
  //   babel({
  //     exclude: "node_modules/**"
  //   })
  // ]
};
