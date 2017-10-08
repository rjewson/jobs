export default {
  input: 'src/index.js',
  output: {
    file: 'dist/jobs.js',
    format: 'cjs'
  },
  watch: {
    include: 'src/**'
  }
};