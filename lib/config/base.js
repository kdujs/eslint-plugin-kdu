module.exports = {
  root: true,

  parser: require.resolve('kdu-eslint-parser'),

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true
    }
  },

  env: {
    browser: true,
    es6: true
  },

  plugins: [
    'kdu'
  ],

  rules: require('../base-rules.js')
}
