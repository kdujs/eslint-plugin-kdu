/**
 * @fileoverview enforce usage of `exact` modifier on `k-on`.
 * @author NKDuy
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
    type: 'suggestion',
    docs: {
      description: 'enforce usage of `exact` modifier on `k-on`',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/use-k-on-exact.md'
    },
    fixable: null,
    schema: []
  },

  /**
   * Creates AST event handlers for use-k-on-exact.
   *
   * @param {RuleContext} context - The rule context.
   * @returns {Object} AST event handlers.
   */
  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      KStartTag (node) {
        if (node.attributes.length > 1) {
          const groups = node.attributes
            .map(item => item.key)
            .filter(item => item && item.type === 'KDirectiveKey' && item.name === 'on')
            .reduce((rv, item) => {
              (rv[item.argument] = rv[item.argument] || []).push(item)
              return rv
            }, {})

          const directives = Object.keys(groups).map(key => groups[key])
          // const directives = Object.values(groups) // Uncomment after node 6 is dropped
            .filter(item => item.length > 1)
          for (const group of directives) {
            if (group.some(item => item.modifiers.length > 0)) { // check if there are directives with modifiers
              const invalid = group.filter(item => item.modifiers.length === 0)
              for (const node of invalid) {
                context.report({
                  node,
                  loc: node.loc,
                  message: "Consider to use '.exact' modifier."
                })
              }
            }
          }
        }
      }
    })
  }
}
