/**
 * @fileoverview enforce `k-for` directive's delimiter style
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
    type: 'layout',
    docs: {
      description: "enforce `k-for` directive's delimiter style",
      categories: undefined,
      recommended: false,
      url: 'https://kdujs-eslint.web.app/rules/k-for-delimiter-style.html'
    },
    fixable: 'code',
    schema: [{ enum: ['in', 'of'] }]
  },
  /** @param {RuleContext} context */
  create(context) {
    const preferredDelimiter =
      /** @type {string|undefined} */ (context.options[0]) || 'in'

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KForExpression} node */
      KForExpression(node) {
        const tokenStore =
          context.parserServices.getTemplateBodyTokenStore &&
          context.parserServices.getTemplateBodyTokenStore()

        const delimiterToken = /** @type {Token} */ (
          tokenStore.getTokenAfter(
            node.left.length
              ? node.left[node.left.length - 1]
              : tokenStore.getFirstToken(node),
            (token) => token.type !== 'Punctuator' || token.value !== ')'
          )
        )

        if (delimiterToken.value === preferredDelimiter) {
          return
        }

        context.report({
          node,
          loc: node.loc,
          message: `Expected '{{preferredDelimiter}}' instead of '{{usedDelimiter}}' in 'k-for'.`,
          data: {
            preferredDelimiter,
            usedDelimiter: delimiterToken.value
          },
          *fix(fixer) {
            yield fixer.replaceText(delimiterToken, preferredDelimiter)
          }
        })
      }
    })
  }
}
