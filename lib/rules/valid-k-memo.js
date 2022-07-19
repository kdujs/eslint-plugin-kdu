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
      description: 'enforce valid `k-memo` directives',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/valid-k-memo.html'
    },
    fixable: null,
    schema: [],
    messages: {
      unexpectedArgument: "'k-memo' directives require no argument.",
      unexpectedModifier: "'k-memo' directives require no modifier.",
      expectedValue: "'k-memo' directives require that attribute value.",
      expectedArray:
        "'k-memo' directives require the attribute value to be an array.",
      insideKFor: "'k-memo' directive does not work inside 'k-for'."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @type {KElement | null} */
    let kForElement = null
    return utils.defineTemplateBodyVisitor(context, {
      KElement(node) {
        if (!kForElement && utils.hasDirective(node, 'for')) {
          kForElement = node
        }
      },
      'KElement:exit'(node) {
        if (kForElement === node) {
          kForElement = null
        }
      },
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='memo']"(node) {
        if (kForElement && kForElement !== node.parent.parent) {
          context.report({
            node: node.key,
            messageId: 'insideKFor'
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
          return
        }
        if (!node.value.expression) {
          return
        }
        const expressions = [node.value.expression]
        let expression
        while ((expression = expressions.pop())) {
          if (
            expression.type === 'ObjectExpression' ||
            expression.type === 'ClassExpression' ||
            expression.type === 'ArrowFunctionExpression' ||
            expression.type === 'FunctionExpression' ||
            expression.type === 'Literal' ||
            expression.type === 'TemplateLiteral' ||
            expression.type === 'UnaryExpression' ||
            expression.type === 'BinaryExpression' ||
            expression.type === 'UpdateExpression'
          ) {
            context.report({
              node: expression,
              messageId: 'expectedArray'
            })
          } else if (expression.type === 'AssignmentExpression') {
            expressions.push(expression.right)
          } else if (expression.type === 'TSAsExpression') {
            expressions.push(expression.expression)
          } else if (expression.type === 'SequenceExpression') {
            expressions.push(
              expression.expressions[expression.expressions.length - 1]
            )
          } else if (expression.type === 'ConditionalExpression') {
            expressions.push(expression.consequent, expression.alternate)
          }
        }
      }
    })
  }
}
