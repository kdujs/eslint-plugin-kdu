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
 * Creates AST event handlers for require-component-is.
 *
 * @param {RuleContext} context - The rule context.
 * @returns {Object} AST event handlers.
 */
function create (context) {
  return utils.defineTemplateBodyVisitor(context, {
    "KElement[name='component']" (node) {
      if (!utils.hasDirective(node, 'bind', 'is')) {
        context.report({
          node,
          loc: node.loc,
          message: "Expected '<component>' elements to have 'k-bind:is' attribute."
        })
      }
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
      description: 'require `k-bind:is` of `<component>` elements',
      category: 'essential'
    },
    fixable: false,
    schema: []
  }
}
