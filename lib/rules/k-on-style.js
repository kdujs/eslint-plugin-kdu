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
 * Creates AST event handlers for k-on-style.
 *
 * @param {RuleContext} context - The rule context.
 * @returns {Object} AST event handlers.
 */
function create (context) {
  const shorthand = context.options[0] !== 'longform'

  return utils.defineTemplateBodyVisitor(context, {
    "KAttribute[directive=true][key.name='on'][key.argument!=null]" (node) {
      if (node.key.shorthand === shorthand) {
        return
      }

      const pos = node.range[0]
      context.report({
        node,
        loc: node.loc,
        message: shorthand
          ? "Expected '@' instead of 'k-on:'."
          : "Expected 'k-on:' instead of '@'.",
        fix: (fixer) => shorthand
          ? fixer.replaceTextRange([pos, pos + 5], '@')
          : fixer.replaceTextRange([pos, pos + 1], 'k-on:')
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
      description: 'enforce `k-on` directive style',
      category: 'strongly-recommended'
    },
    fixable: 'code',
    schema: [
      { enum: ['shorthand', 'longform'] }
    ]
  }
}