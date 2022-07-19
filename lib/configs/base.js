/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
module.exports = {
  parser: require.resolve('kdu-eslint-parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    browser: true,
    es6: true
  },
  plugins: ['kdu'],
  rules: {
    'kdu/comment-directive': 'error',
    'kdu/jsx-uses-vars': 'error',
    'kdu/script-setup-uses-vars': 'error'
  }
}
