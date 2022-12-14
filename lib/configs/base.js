/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update it's content execute "npm run update"
 */
module.exports = {
  root: true,
  parser: require.resolve('kdu-eslint-parser'),
  parserOptions: {
    ecmaVersion: 2015,
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
  rules: {
    'kdu/comment-directive': 'error',
    'kdu/jsx-uses-vars': 'error'
  }
}
