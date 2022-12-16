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
      description: 'require `k-bind:key` with `k-for` directives',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/require-k-for-key.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    /**
     * Check the given element about `k-bind:key` attributes.
     * @param {ASTNode} element The element node to check.
     */
    function checkKey (element) {
      if (element.name === 'template' || element.name === 'slot') {
        for (const child of element.children) {
          if (child.type === 'KElement') {
            checkKey(child)
          }
        }
      } else if (!utils.isCustomComponent(element) && !utils.hasDirective(element, 'bind', 'key')) {
        context.report({
          node: element.startTag,
          loc: element.startTag.loc,
          message: "Elements in iteration expect to have 'k-bind:key' directives."
        })
      }
    }

    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name='for']" (node) {
        checkKey(node.parent.parent)
      }
    })
  }
}
