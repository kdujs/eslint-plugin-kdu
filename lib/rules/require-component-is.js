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
      description: 'require `k-bind:is` of `<component>` elements',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/require-component-is.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
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
}
