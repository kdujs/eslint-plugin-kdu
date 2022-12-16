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
      description: 'enforce valid `k-pre` directives',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/valid-k-pre.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name='pre']" (node) {
        if (node.key.argument) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-pre' directives require no argument."
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-pre' directives require no modifier."
          })
        }
        if (node.value) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-pre' directives require no attribute value."
          })
        }
      }
    })
  }
}
