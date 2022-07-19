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
      description:
        'require control the display of the content inside `<transition>`',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/require-toggle-inside-transition.html'
    },
    fixable: null,
    schema: [],
    messages: {
      expected:
        'The element inside `<transition>` is expected to have a `k-if` or `k-show` directive.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /**
     * Check if the given element has display control.
     * @param {KElement} element The element node to check.
     */
    function verifyInsideElement(element) {
      if (utils.isCustomComponent(element)) {
        return
      }
      if (
        !utils.hasDirective(element, 'if') &&
        !utils.hasDirective(element, 'show')
      ) {
        context.report({
          node: element.startTag,
          loc: element.startTag.loc,
          messageId: 'expected'
        })
      }
    }

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KElement} node */
      "KElement[name='transition'] > KElement"(node) {
        if (node.parent.children[0] !== node) {
          return
        }
        verifyInsideElement(node)
      }
    })
  }
}
