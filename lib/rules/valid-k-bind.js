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

const VALID_MODIFIERS = new Set(['prop', 'camel', 'sync'])

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce valid `k-bind` directives',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/valid-k-bind.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name='bind']" (node) {
        for (const modifier of node.key.modifiers) {
          if (!VALID_MODIFIERS.has(modifier)) {
            context.report({
              node,
              loc: node.key.loc,
              message: "'k-bind' directives don't support the modifier '{{name}}'.",
              data: { name: modifier }
            })
          }
        }

        if (!utils.hasAttributeValue(node)) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-bind' directives require an attribute value."
          })
        }
      }
    })
  }
}
