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
 * @param {ASTNode} kFor The attribute node of `k-for` to check.
 * @param {ASTNode} kBindKey The attribute node of `k-bind:key` to check.
 * @returns {boolean} `true` if the node is using the variables which are defined by `k-for` directives.
 */
function isUsingIterationVar (kFor, kBindKey) {
  if (kBindKey.value == null) {
    return false
  }
  const references = kBindKey.value.references
  const variables = kFor.parent.parent.variables
  return references.some(reference =>
    variables.some(variable =>
      variable.id.name === reference.id.name &&
            variable.kind === 'k-for'
    )
  )
}

/**
 * Check the child element in tempalte k-for about `k-bind:key` attributes.
 * @param {RuleContext} context The rule context to report.
 * @param {ASTNode} kFor The attribute node of `k-for` to check.
 * @param {ASTNode} child The child node to check.
 */
function checkChildKey (context, kFor, child) {
  const childFor = utils.getDirective(child, 'for')
  // if child has k-for, check if parent iterator is used in k-for
  if (childFor != null) {
    const childForRefs = childFor.value.references
    const variables = kFor.parent.parent.variables
    const usedInFor = childForRefs.some(cref =>
      variables.some(variable =>
        cref.id.name === variable.id.name &&
        variable.kind === 'k-for'
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
 * @param {ASTNode} kFor The attribute node of `k-for` to check.
 * @param {ASTNode} element The element node to check.
 */
function checkKey (context, kFor, element) {
  if (element.name === 'template') {
    for (const child of element.children) {
      if (child.type === 'KElement') {
        checkChildKey(context, kFor, child)
      }
    }
    return
  }

  const kBindKey = utils.getDirective(element, 'bind', 'key')

  if (utils.isCustomComponent(element) && kBindKey == null) {
    context.report({
      node: element.startTag,
      loc: element.startTag.loc,
      message: "Custom elements in iteration require 'k-bind:key' directives."
    })
  }
  if (kBindKey != null && !isUsingIterationVar(kFor, kBindKey)) {
    context.report({
      node: kBindKey,
      loc: kBindKey.loc,
      message: "Expected 'k-bind:key' directive to use the variables which are defined by the 'k-for' directive."
    })
  }
}

/**
 * Creates AST event handlers for valid-k-for.
 *
 * @param {RuleContext} context - The rule context.
 * @returns {Object} AST event handlers.
 */
function create (context) {
  const sourceCode = context.getSourceCode()

  return utils.defineTemplateBodyVisitor(context, {
    "KAttribute[directive=true][key.name='for']" (node) {
      const element = node.parent.parent

      checkKey(context, node, element)

      if (node.key.argument) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-for' directives require no argument."
        })
      }
      if (node.key.modifiers.length > 0) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-for' directives require no modifier."
        })
      }
      if (!utils.hasAttributeValue(node)) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-for' directives require that attribute value."
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
          loc: node.value.loc,
          message: "'k-for' directives require the special syntax '<alias> in <expression>'."
        })
        return
      }

      const lhs = expr.left
      const value = lhs[0]
      const key = lhs[1]
      const index = lhs[2]

      if (value === null) {
        context.report({
          node: value || expr,
          loc: value && value.loc,
          message: "Invalid alias ''."
        })
      }
      if (key !== undefined && (!key || key.type !== 'Identifier')) {
        context.report({
          node: key || expr,
          loc: key && key.loc,
          message: "Invalid alias '{{text}}'.",
          data: { text: key ? sourceCode.getText(key) : '' }
        })
      }
      if (index !== undefined && (!index || index.type !== 'Identifier')) {
        context.report({
          node: index || expr,
          loc: index && index.loc,
          message: "Invalid alias '{{text}}'.",
          data: { text: index ? sourceCode.getText(index) : '' }
        })
      }
    }
  })
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  create,
  meta: {
    docs: {
      description: 'enforce valid `k-for` directives',
      category: 'essential'
    },
    fixable: false,
    schema: []
  }
}
