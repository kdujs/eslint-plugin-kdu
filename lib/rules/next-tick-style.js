/**
 * @fileoverview enforce Promise or callback style in `nextTick`
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')
const { findVariable } = require('eslint-utils')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * @param {Identifier} identifier
 * @param {RuleContext} context
 * @returns {CallExpression|undefined}
 */
function getKduNextTickCallExpression(identifier, context) {
  // Instance API: this.$nextTick()
  if (
    identifier.name === '$nextTick' &&
    identifier.parent.type === 'MemberExpression' &&
    utils.isThis(identifier.parent.object, context) &&
    identifier.parent.parent.type === 'CallExpression' &&
    identifier.parent.parent.callee === identifier.parent
  ) {
    return identifier.parent.parent
  }

  // Kdu 2 Global API: Kdu.nextTick()
  if (
    identifier.name === 'nextTick' &&
    identifier.parent.type === 'MemberExpression' &&
    identifier.parent.object.type === 'Identifier' &&
    identifier.parent.object.name === 'Kdu' &&
    identifier.parent.parent.type === 'CallExpression' &&
    identifier.parent.parent.callee === identifier.parent
  ) {
    return identifier.parent.parent
  }

  // Kdu 3 Global API: import { nextTick as nt } from 'kdu'; nt()
  if (
    identifier.parent.type === 'CallExpression' &&
    identifier.parent.callee === identifier
  ) {
    const variable = findVariable(context.getScope(), identifier)

    if (variable != null && variable.defs.length === 1) {
      const def = variable.defs[0]
      if (
        def.type === 'ImportBinding' &&
        def.node.type === 'ImportSpecifier' &&
        def.node.imported.type === 'Identifier' &&
        def.node.imported.name === 'nextTick' &&
        def.node.parent.type === 'ImportDeclaration' &&
        def.node.parent.source.value === 'kdu'
      ) {
        return identifier.parent
      }
    }
  }

  return undefined
}

/**
 * @param {CallExpression} callExpression
 * @returns {boolean}
 */
function isAwaitedPromise(callExpression) {
  return (
    callExpression.parent.type === 'AwaitExpression' ||
    (callExpression.parent.type === 'MemberExpression' &&
      callExpression.parent.property.type === 'Identifier' &&
      callExpression.parent.property.name === 'then')
  )
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce Promise or callback style in `nextTick`',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/next-tick-style.html'
    },
    fixable: 'code',
    schema: [{ enum: ['promise', 'callback'] }]
  },
  /** @param {RuleContext} context */
  create(context) {
    const preferredStyle =
      /** @type {string|undefined} */ (context.options[0]) || 'promise'

    return utils.defineKduVisitor(context, {
      /** @param {Identifier} node */
      Identifier(node) {
        const callExpression = getKduNextTickCallExpression(node, context)
        if (!callExpression) {
          return
        }

        if (preferredStyle === 'callback') {
          if (
            callExpression.arguments.length !== 1 ||
            isAwaitedPromise(callExpression)
          ) {
            context.report({
              node,
              message:
                'Pass a callback function to `nextTick` instead of using the returned Promise.'
            })
          }

          return
        }

        if (
          callExpression.arguments.length !== 0 ||
          !isAwaitedPromise(callExpression)
        ) {
          context.report({
            node,
            message:
              'Use the Promise returned by `nextTick` instead of passing a callback function.',
            fix(fixer) {
              return fixer.insertTextAfter(node, '().then')
            }
          })
        }
      }
    })
  }
}
