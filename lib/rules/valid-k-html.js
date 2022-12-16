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
      description: 'enforce valid `k-html` directives',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/valid-k-html.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name='html']" (node) {
        if (node.key.argument) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-html' directives require no argument."
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-html' directives require no modifier."
          })
        }
        if (!utils.hasAttributeValue(node)) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-html' directives require that attribute value."
          })
        }
      }
    })
  }
}
