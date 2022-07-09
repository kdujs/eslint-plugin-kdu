'use strict'

module.exports = {
  processors: {
    '.kdu': require('eslint-plugin-html').processors['.kdu']
  },
  rules: {
    'jsx-uses-vars': require('eslint-plugin-react/lib/rules/jsx-uses-vars')
  }
}
