/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
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
    type: 'problem',
    docs: {
      description: 'disallow mustaches in `<textarea>`',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/no-textarea-mustache.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KElement[name='textarea'] KExpressionContainer" (node) {
        if (node.parent.type !== 'KElement') {
          return
        }

        context.report({
          node,
          loc: node.loc,
          message: "Unexpected mustache. Use 'k-model' instead."
        })
      }
    })
  }
}
