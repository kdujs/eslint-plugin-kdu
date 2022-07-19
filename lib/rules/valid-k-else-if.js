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
      description: 'enforce valid `k-else-if` directives',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/valid-k-else-if.html'
    },
    fixable: null,
    schema: [],
    messages: {
      missingKIf:
        "'k-else-if' directives require being preceded by the element which has a 'k-if' or 'k-else-if' directive.",
      withKIf:
        "'k-else-if' and 'k-if' directives can't exist on the same element.",
      withKElse:
        "'k-else-if' and 'k-else' directives can't exist on the same element.",
      unexpectedArgument: "'k-else-if' directives require no argument.",
      unexpectedModifier: "'k-else-if' directives require no modifier.",
      expectedValue: "'k-else-if' directives require that attribute value."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='else-if']"(node) {
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
        if (utils.hasDirective(element, 'else')) {
          context.report({
            node,
            messageId: 'withKElse'
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
        if (!node.value || utils.isEmptyValueDirective(node, context)) {
          context.report({
            node,
            messageId: 'expectedValue'
          })
        }
      }
    })
  }
}
