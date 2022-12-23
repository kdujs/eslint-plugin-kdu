/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const rules = require('./rules')

const categoryTitles = {
  base: {
    text: 'Base Rules (Enabling Correct ESLint Parsing)',
    kdupress: 'Base Rules (Enabling Correct ESLint Parsing)'
  },
  'kdu3-essential': {
    text: 'Priority A: Essential (Error Prevention) for Kdu.js 3.x',
    kdupress:
      'Priority A: Essential (Error Prevention) <badge text="for Kdu.js 3.x" vertical="middle">for Kdu.js 3.x</badge>'
  },
  'kdu3-strongly-recommended': {
    text: 'Priority B: Strongly Recommended (Improving Readability) for Kdu.js 3.x',
    kdupress:
      'Priority B: Strongly Recommended (Improving Readability) <badge text="for Kdu.js 3.x" vertical="middle">for Kdu.js 3.x</badge>'
  },
  'kdu3-recommended': {
    text: 'Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead) for Kdu.js 3.x',
    kdupress:
      'Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead) <badge text="for Kdu.js 3.x" vertical="middle">for Kdu.js 3.x</badge>'
  },
  'kdu3-use-with-caution': {
    text: 'Priority D: Use with Caution (Potentially Dangerous Patterns) for Kdu.js 3.x',
    kdupress:
      'Priority D: Use with Caution (Potentially Dangerous Patterns) <badge text="for Kdu.js 3.x" vertical="middle">for Kdu.js 3.x</badge>'
  },
  essential: {
    text: 'Priority A: Essential (Error Prevention) for Kdu.js 2.x',
    kdupress:
      'Priority A: Essential (Error Prevention) <badge text="for Kdu.js 2.x" vertical="middle" type="warn">for Kdu.js 2.x</badge>'
  },
  'strongly-recommended': {
    text: 'Priority B: Strongly Recommended (Improving Readability) for Kdu.js 2.x',
    kdupress:
      'Priority B: Strongly Recommended (Improving Readability) <badge text="for Kdu.js 2.x" vertical="middle" type="warn">for Kdu.js 2.x</badge>'
  },
  recommended: {
    text: 'Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead) for Kdu.js 2.x',
    kdupress:
      'Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead) <badge text="for Kdu.js 2.x" vertical="middle" type="warn">for Kdu.js 2.x</badge>'
  },
  'use-with-caution': {
    text: 'Priority D: Use with Caution (Potentially Dangerous Patterns) for Kdu.js 2.x',
    kdupress:
      'Priority D: Use with Caution (Potentially Dangerous Patterns) <badge text="for Kdu.js 2.x" vertical="middle" type="warn">for Kdu.js 2.x</badge>'
  }
}
const categoryIds = Object.keys(categoryTitles)
const categoryRules = {}

for (const rule of rules) {
  const categories = rule.meta.docs.categories || ['uncategorized']
  for (const categoryId of categories) {
    // Throw if no title is defined for a category
    if (categoryId !== 'uncategorized' && !categoryTitles[categoryId]) {
      throw new Error(`Category "${categoryId}" does not have a title defined.`)
    }
    const catRules =
      categoryRules[categoryId] || (categoryRules[categoryId] = [])
    catRules.push(rule)
  }
}

module.exports = categoryIds
  .map((categoryId) => ({
    categoryId,
    title: categoryTitles[categoryId],
    rules: (categoryRules[categoryId] || []).filter(
      (rule) => !rule.meta.deprecated
    )
  }))
  .filter((category) => category.rules.length >= 1)
