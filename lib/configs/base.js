/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update it's content execute "npm run update"
 */
module.exports = {
  parser: require.resolve('kdu-eslint-parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
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
