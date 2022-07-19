/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

/*
This script updates `lib/configs/*.js` files from rule's meta data.
*/

const fs = require('fs')
const path = require('path')
const eslint = require('eslint')
const categories = require('./lib/categories')

const errorCategories = ['base', 'essential', 'kdu3-essential']

const extendsCategories = {
  base: null,
  essential: 'base',
  'kdu3-essential': 'base',
  'strongly-recommended': 'essential',
  'kdu3-strongly-recommended': 'kdu3-essential',
  recommended: 'strongly-recommended',
  'kdu3-recommended': 'kdu3-strongly-recommended',
  'use-with-caution': 'recommended',
  'kdu3-use-with-caution': 'kdu3-recommended'
}

function formatRules(rules, categoryId) {
  const obj = rules.reduce((setting, rule) => {
    let options = errorCategories.includes(categoryId) ? 'error' : 'warn'
    const defaultOptions =
      rule.meta && rule.meta.docs && rule.meta.docs.defaultOptions
    if (defaultOptions) {
      const v = categoryId.startsWith('kdu3') ? 3 : 2
      const defaultOption = defaultOptions[`kdu${v}`]
      if (defaultOption) {
        options = [options, ...defaultOption]
      }
    }
    setting[rule.ruleId] = options
    return setting
  }, {})
  return JSON.stringify(obj, null, 2)
}

function formatCategory(category) {
  const extendsCategoryId = extendsCategories[category.categoryId]
  if (extendsCategoryId == null) {
    return `/*
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
  plugins: [
    'kdu'
  ],
  rules: ${formatRules(category.rules, category.categoryId)}
}
`
  }
  return `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
module.exports = {
  extends: require.resolve('./${extendsCategoryId}'),
  rules: ${formatRules(category.rules, category.categoryId)}
}
`
}

// Update files.
const ROOT = path.resolve(__dirname, '../lib/configs/')
categories.forEach((category) => {
  const filePath = path.join(ROOT, `${category.categoryId}.js`)
  const content = formatCategory(category)

  fs.writeFileSync(filePath, content)
})

// Format files.
async function format() {
  const linter = new eslint.ESLint({ fix: true })
  const report = await linter.lintFiles([ROOT])
  eslint.ESLint.outputFixes(report)
}

format()
