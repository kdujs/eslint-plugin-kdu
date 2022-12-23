/**
 * @fileoverview require the component to be directly exported
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require the component to be directly exported',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/require-direct-export.html'
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      {
        type: 'object',
        properties: {
          disallowFunctionalComponentFunction: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    const filePath = context.getFilename()
    if (!utils.isKduFile(filePath)) return {}

    const disallowFunctional = (context.options[0] || {})
      .disallowFunctionalComponentFunction

    /**
     * @typedef {object} ScopeStack
     * @property {ScopeStack | null} upper
     * @property {boolean} withinKdu3FunctionalBody
     */

    /** @type { { body: BlockStatement, hasReturnArgument: boolean } } */
    let maybeKdu3Functional
    /** @type {ScopeStack | null} */
    let scopeStack = null

    return {
      /** @param {Declaration | Expression} node */
      'ExportDefaultDeclaration > *'(node) {
        if (node.type === 'ObjectExpression') {
          // OK
          return
        }
        if (node.type === 'CallExpression') {
          const {
            callee,
            arguments: [firstArg]
          } = node
          if (firstArg && firstArg.type === 'ObjectExpression') {
            if (
              (callee.type === 'Identifier' &&
                callee.name === 'defineComponent') ||
              (callee.type === 'MemberExpression' &&
                callee.object.type === 'Identifier' &&
                callee.object.name === 'Kdu' &&
                callee.property.type === 'Identifier' &&
                callee.property.name === 'extend')
            ) {
              return
            }
          }
        }
        if (!disallowFunctional) {
          if (node.type === 'ArrowFunctionExpression') {
            if (node.body.type !== 'BlockStatement') {
              // OK
              return
            }
            maybeKdu3Functional = {
              body: node.body,
              hasReturnArgument: false
            }
            return
          }
          if (
            node.type === 'FunctionExpression' ||
            node.type === 'FunctionDeclaration'
          ) {
            maybeKdu3Functional = {
              body: node.body,
              hasReturnArgument: false
            }
            return
          }
        }

        context.report({
          node: node.parent,
          message: `Expected the component literal to be directly exported.`
        })
      },
      ...(disallowFunctional
        ? {}
        : {
            /** @param {BlockStatement} node */
            ':function > BlockStatement'(node) {
              if (!maybeKdu3Functional) {
                return
              }
              scopeStack = {
                upper: scopeStack,
                withinKdu3FunctionalBody: maybeKdu3Functional.body === node
              }
            },
            /** @param {ReturnStatement} node */
            ReturnStatement(node) {
              if (
                scopeStack &&
                scopeStack.withinKdu3FunctionalBody &&
                node.argument
              ) {
                maybeKdu3Functional.hasReturnArgument = true
              }
            },
            ':function > BlockStatement:exit'() {
              scopeStack = scopeStack && scopeStack.upper
            },
            /** @param {ExportDefaultDeclaration} node */
            'ExportDefaultDeclaration:exit'(node) {
              if (!maybeKdu3Functional) {
                return
              }
              if (!maybeKdu3Functional.hasReturnArgument) {
                context.report({
                  node,
                  message: `Expected the component literal to be directly exported.`
                })
              }
            }
          })
    }
  }
}
