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
// Helpers
// ------------------------------------------------------------------------------

/**
 * Check whether the given attribute is using the variables which are defined by `k-for` directives.
 * @param {KDirective} kFor The attribute node of `k-for` to check.
 * @param {KDirective} kBindKey The attribute node of `k-bind:key` to check.
 * @returns {boolean} `true` if the node is using the variables which are defined by `k-for` directives.
 */
function isUsingIterationVar(kFor, kBindKey) {
  if (kBindKey.value == null) {
    return false
  }
  const references = kBindKey.value.references
  const variables = kFor.parent.parent.variables
  return references.some((reference) =>
    variables.some(
      (variable) =>
        variable.id.name === reference.id.name && variable.kind === 'k-for'
    )
  )
}

/**
 * Check the child element in tempalte k-for about `k-bind:key` attributes.
 * @param {RuleContext} context The rule context to report.
 * @param {KDirective} kFor The attribute node of `k-for` to check.
 * @param {KElement} child The child node to check.
 */
function checkChildKey(context, kFor, child) {
  const childFor = utils.getDirective(child, 'for')
  // if child has k-for, check if parent iterator is used in k-for
  if (childFor != null) {
    const childForRefs = (childFor.value && childFor.value.references) || []
    const variables = kFor.parent.parent.variables
    const usedInFor = childForRefs.some((cref) =>
      variables.some(
        (variable) =>
          cref.id.name === variable.id.name && variable.kind === 'k-for'
      )
    )
    // if parent iterator is used, skip other checks
    // iterator usage will be checked later by child k-for
    if (usedInFor) {
      return
    }
  }
  // otherwise, check if parent iterator is directly used in child's key
  checkKey(context, kFor, child)
}

/**
 * Check the given element about `k-bind:key` attributes.
 * @param {RuleContext} context The rule context to report.
 * @param {KDirective} kFor The attribute node of `k-for` to check.
 * @param {KElement} element The element node to check.
 */
function checkKey(context, kFor, element) {
  const kBindKey = utils.getDirective(element, 'bind', 'key')

  if (kBindKey == null && element.name === 'template') {
    for (const child of element.children) {
      if (child.type === 'KElement') {
        checkChildKey(context, kFor, child)
      }
    }
    return
  }

  if (utils.isCustomComponent(element) && kBindKey == null) {
    context.report({
      node: element.startTag,
      messageId: 'requireKey'
    })
  }
  if (kBindKey != null && !isUsingIterationVar(kFor, kBindKey)) {
    context.report({
      node: kBindKey,
      messageId: 'keyUseKForVars'
    })
  }
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce valid `k-for` directives',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/valid-k-for.html'
    },
    fixable: null,
    schema: [],
    messages: {
      requireKey:
        "Custom elements in iteration require 'k-bind:key' directives.",
      keyUseKForVars:
        "Expected 'k-bind:key' directive to use the variables which are defined by the 'k-for' directive.",
      unexpectedArgument: "'k-for' directives require no argument.",
      unexpectedModifier: "'k-for' directives require no modifier.",
      expectedValue: "'k-for' directives require that attribute value.",
      unexpectedExpression:
        "'k-for' directives require the special syntax '<alias> in <expression>'.",
      invalidEmptyAlias: "Invalid alias ''.",
      invalidAlias: "Invalid alias '{{text}}'."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const sourceCode = context.getSourceCode()

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='for']"(node) {
        const element = node.parent.parent

        checkKey(context, node, element)

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

        const expr = node.value.expression
        if (expr == null) {
          return
        }
        if (expr.type !== 'KForExpression') {
          context.report({
            node: node.value,
            messageId: 'unexpectedExpression'
          })
          return
        }

        const lhs = expr.left
        const value = lhs[0]
        const key = lhs[1]
        const index = lhs[2]

        if (value === null) {
          context.report({
            node: expr,
            messageId: 'invalidEmptyAlias'
          })
        }
        if (key !== undefined && (!key || key.type !== 'Identifier')) {
          context.report({
            node: key || expr,
            messageId: 'invalidAlias',
            data: { text: key ? sourceCode.getText(key) : '' }
          })
        }
        if (index !== undefined && (!index || index.type !== 'Identifier')) {
          context.report({
            node: index || expr,
            messageId: 'invalidAlias',
            data: { text: index ? sourceCode.getText(index) : '' }
          })
        }
      }
    })
  }
}
