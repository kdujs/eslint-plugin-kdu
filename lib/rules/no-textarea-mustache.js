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
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-textarea-mustache.html'
    },
    fixable: null,
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KExpressionContainer} node */
      "KElement[name='textarea'] KExpressionContainer"(node) {
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
