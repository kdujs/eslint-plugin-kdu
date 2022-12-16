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
      description: 'enforce valid `k-if` directives',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/valid-k-if.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name='if']" (node) {
        const element = node.parent.parent

        if (utils.hasDirective(element, 'else')) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-if' and 'k-else' directives can't exist on the same element. You may want 'k-else-if' directives."
          })
        }
        if (utils.hasDirective(element, 'else-if')) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-if' and 'k-else-if' directives can't exist on the same element."
          })
        }
        if (node.key.argument) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-if' directives require no argument."
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-if' directives require no modifier."
          })
        }
        if (!utils.hasAttributeValue(node)) {
          context.report({
            node,
            loc: node.loc,
            message: "'k-if' directives require that attribute value."
          })
        }
      }
    })
  }
}
