/**
 * @fileoverview disallow unused variable definitions of k-for directives or scope attributes.
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow unused variable definitions of k-for directives or scope attributes',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/no-unused-vars.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      KElement (node) {
        const variables = node.variables

        for (
          let i = variables.length - 1;
          i >= 0 && !variables[i].references.length;
          i--
        ) {
          const variable = variables[i]
          context.report({
            node: variable.id,
            loc: variable.id.loc,
            message: `'{{name}}' is defined but never used.`,
            data: variable.id
          })
        }
      }
    })
  }
}
