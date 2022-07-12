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
// Helpers
// ------------------------------------------------------------------------------

/**
 * Creates AST event handlers for no-textarea-mustache.
 *
 * @param {RuleContext} context - The rule context.
 * @returns {Object} AST event handlers.
 */
function create (context) {
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

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  create,
  meta: {
    docs: {
      description: 'disallow mustaches in `<textarea>`',
      category: 'essential'
    },
    fixable: false,
    schema: []
  }
}
