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
      description: 'enforce valid `k-else` directives',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/valid-k-else.html'
    },
    fixable: null,
    schema: [],
    messages: {
      missingKIf:
        "'k-else' directives require being preceded by the element which has a 'k-if' or 'k-else-if' directive.",
      withKIf:
        "'k-else' and 'k-if' directives can't exist on the same element. You may want 'k-else-if' directives.",
      withKElseIf:
        "'k-else' and 'k-else-if' directives can't exist on the same element.",
      unexpectedArgument: "'k-else' directives require no argument.",
      unexpectedModifier: "'k-else' directives require no modifier.",
      unexpectedValue: "'k-else' directives require no attribute value."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='else']"(node) {
        const element = node.parent.parent

        if (!utils.prevElementHasIf(element)) {
          context.report({
            node,
            messageId: 'missingKIf'
          })
        }
        if (utils.hasDirective(element, 'if')) {
          context.report({
            node,
            messageId: 'withKIf'
          })
        }
        if (utils.hasDirective(element, 'else-if')) {
          context.report({
            node,
            messageId: 'withKElseIf'
          })
        }
        if (node.key.argument) {
          context.report({
            node: node.key.argument,
            messageId: 'unexpectedArgument'
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: {
              start: node.key.modifiers[0].loc.start,
              end: node.key.modifiers[node.key.modifiers.length - 1].loc.end
            },
            messageId: 'unexpectedModifier'
          })
        }
        if (node.value) {
          context.report({
            node: node.value,
            messageId: 'unexpectedValue'
          })
        }
      }
    })
  }
}
