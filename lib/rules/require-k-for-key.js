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
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/require-k-for-key.html'
    },
    fixable: null,
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    /**
     * Check the given element about `k-bind:key` attributes.
     * @param {KElement} element The element node to check.
     */
    function checkKey(element) {
      if (utils.hasDirective(element, 'bind', 'key')) {
        return
      }
      if (element.name === 'template' || element.name === 'slot') {
        for (const child of element.children) {
          if (child.type === 'KElement') {
            checkKey(child)
          }
        }
      } else if (!utils.isCustomComponent(element)) {
        context.report({
          node: element.startTag,
          loc: element.startTag.loc,
          message:
            "Elements in iteration expect to have 'k-bind:key' directives."
        })
      }
    }

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='for']"(node) {
        checkKey(node.parent.parent)
      }
    })
  }
}
