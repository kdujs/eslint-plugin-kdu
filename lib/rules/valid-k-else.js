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
 * Creates AST event handlers for valid-k-else.
 *
 * @param {RuleContext} context - The rule context.
 * @returns {Object} AST event handlers.
 */
function create (context) {
  return utils.defineTemplateBodyVisitor(context, {
    "KAttribute[directive=true][key.name='else']" (node) {
      const element = node.parent.parent

      if (!utils.prevElementHasIf(element)) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-else' directives require being preceded by the element which has a 'k-if' or 'k-else' directive."
        })
      }
      if (utils.hasDirective(element, 'if')) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-else' and 'k-if' directives can't exist on the same element. You may want 'k-else-if' directives."
        })
      }
      if (utils.hasDirective(element, 'else-if')) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-else' and 'k-else-if' directives can't exist on the same element."
        })
      }
      if (node.key.argument) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-else' directives require no argument."
        })
      }
      if (node.key.modifiers.length > 0) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-else' directives require no modifier."
        })
      }
      if (utils.hasAttributeValue(node)) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-else' directives require no attribute value."
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
      description: 'enforce valid `k-else` directives',
      category: 'essential'
    },
    fixable: false,
    schema: []
  }
}
