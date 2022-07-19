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
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/require-component-is.html'
    },
    fixable: null,
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KElement} node */
      "KElement[name='component']"(node) {
        if (!utils.hasDirective(node, 'bind', 'is')) {
          context.report({
            node,
            loc: node.loc,
            message:
              "Expected '<component>' elements to have 'k-bind:is' attribute."
          })
        }
      }
    })
  }
}
