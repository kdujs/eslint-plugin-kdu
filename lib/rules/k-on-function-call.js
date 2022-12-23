/**
 * @author NKDuy
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

/**
 * @typedef { import('../utils').ComponentPropertyData } ComponentPropertyData
 */

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * Check whether the given token is a quote.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a quote.
 */
function isQuote(token) {
  return (
    token != null &&
    token.type === 'Punctuator' &&
    (token.value === '"' || token.value === "'")
  )
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'enforce or forbid parentheses after method calls without arguments in `k-on` directives',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/k-on-function-call.html'
    },
    fixable: 'code',
    schema: [
      { enum: ['always', 'never'] },
      {
        type: 'object',
        properties: {
          ignoreIncludesComment: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    const always = context.options[0] === 'always'

    /**
     * @param {KOnExpression} node
     * @returns {CallExpression | null}
     */
    function getInvalidNeverCallExpression(node) {
      /** @type {ExpressionStatement} */
      let exprStatement
      let body = node.body
      while (true) {
        const statements = body.filter((st) => st.type !== 'EmptyStatement')
        if (statements.length !== 1) {
          return null
        }
        const statement = statements[0]
        if (statement.type === 'ExpressionStatement') {
          exprStatement = statement
          break
        }
        if (statement.type === 'BlockStatement') {
          body = statement.body
          continue
        }
        return null
      }
      const expression = exprStatement.expression
      if (expression.type !== 'CallExpression' || expression.arguments.length) {
        return null
      }
      if (expression.optional) {
        // Allow optional chaining
        return null
      }
      const callee = expression.callee
      if (callee.type !== 'Identifier') {
        return null
      }
      return expression
    }

    if (always) {
      return utils.defineTemplateBodyVisitor(context, {
        /** @param {Identifier} node */
        "KAttribute[directive=true][key.name.name='on'][key.argument!=null] > KExpressionContainer > Identifier"(
          node
        ) {
          context.report({
            node,
            message:
              "Method calls inside of 'k-on' directives must have parentheses."
          })
        }
      })
    }

    const option = context.options[1] || {}
    const ignoreIncludesComment = !!option.ignoreIncludesComment
    /** @type {Set<string>} */
    const useArgsMethods = new Set()

    return utils.defineTemplateBodyVisitor(
      context,
      {
        /** @param {KOnExpression} node */
        "KAttribute[directive=true][key.name.name='on'][key.argument!=null] KOnExpression"(
          node
        ) {
          const expression = getInvalidNeverCallExpression(node)
          if (!expression) {
            return
          }

          const tokenStore = context.parserServices.getTemplateBodyTokenStore()
          const tokens = tokenStore.getTokens(node.parent, {
            includeComments: true
          })
          /** @type {Token | undefined} */
          let leftQuote
          /** @type {Token | undefined} */
          let rightQuote
          if (isQuote(tokens[0])) {
            leftQuote = tokens.shift()
            rightQuote = tokens.pop()
          }

          const hasComment = tokens.some(
            (token) => token.type === 'Block' || token.type === 'Line'
          )

          if (ignoreIncludesComment && hasComment) {
            return
          }

          if (expression.callee.type === 'Identifier') {
            if (useArgsMethods.has(expression.callee.name)) {
              // The behavior of target method can change given the arguments.
              return
            }
          }

          context.report({
            node: expression,
            message:
              "Method calls without arguments inside of 'k-on' directives must not have parentheses.",
            fix: hasComment
              ? null /* The comment is included and cannot be fixed. */
              : (fixer) => {
                  /** @type {Range} */
                  const range =
                    leftQuote && rightQuote
                      ? [leftQuote.range[1], rightQuote.range[0]]
                      : [tokens[0].range[0], tokens[tokens.length - 1].range[1]]

                  return fixer.replaceTextRange(
                    range,
                    context.getSourceCode().getText(expression.callee)
                  )
                }
          })
        }
      },
      utils.defineKduVisitor(context, {
        onKduObjectEnter(node) {
          for (const method of utils.iterateProperties(
            node,
            new Set(['methods'])
          )) {
            if (useArgsMethods.has(method.name)) {
              continue
            }
            if (method.type !== 'object') {
              continue
            }
            const value = method.property.value
            if (
              (value.type === 'FunctionExpression' ||
                value.type === 'ArrowFunctionExpression') &&
              value.params.length > 0
            ) {
              useArgsMethods.add(method.name)
            }
          }
        }
      })
    )
  }
}
