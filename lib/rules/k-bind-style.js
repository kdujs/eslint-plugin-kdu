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
 * Creates AST event handlers for k-bind-style.
 *
 * @param {RuleContext} context - The rule context.
 * @returns {Object} AST event handlers.
 */
function create (context) {
  const shorthand = context.options[0] !== 'longform'

  return utils.defineTemplateBodyVisitor(context, {
    "KAttribute[directive=true][key.name='bind'][key.argument!=null]" (node) {
      if (node.key.shorthand === shorthand) {
        return
      }

      context.report({
        node,
        loc: node.loc,
        message: shorthand
          ? "Unexpected 'k-bind' before ':'."
          : "Expected 'k-bind' before ':'.",
        fix: (fixer) => shorthand
          ? fixer.removeRange([node.range[0], node.range[0] + 6])
          : fixer.insertTextBefore(node, 'k-bind')
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
      description: 'enforce `k-bind` directive style',
      category: 'strongly-recommended'
    },
    fixable: 'code',
    schema: [
      { enum: ['shorthand', 'longform'] }
    ]
  }
}
