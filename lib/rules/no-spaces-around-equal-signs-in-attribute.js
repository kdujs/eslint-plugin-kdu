/**
 * @author NKDuy
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'disallow spaces around equal signs in attribute',
      category: 'strongly-recommended',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/no-spaces-around-equal-signs-in-attribute.md'
    },
    fixable: 'whitespace',
    schema: []
  },

  create (context) {
    const sourceCode = context.getSourceCode()
    return utils.defineTemplateBodyVisitor(context, {
      'KAttribute' (node) {
        if (!node.value) {
          return
        }
        const range = [node.key.range[1], node.value.range[0]]
        const eqText = sourceCode.text.slice(range[0], range[1])
        const expect = eqText.trim()

        if (eqText !== expect) {
          context.report({
            node: node.key,
            loc: {
              start: node.key.loc.end,
              end: node.value.loc.start
            },
            message: 'Unexpected spaces found around equal signs.',
            data: {},
            fix: fixer => fixer.replaceTextRange(range, expect)
          })
        }
      }
    })
  }
}
