/**
 * @author NKDuy
 * @fileoverview disallow using deprecated filters syntax
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
        'disallow using deprecated filters syntax (in Kdu.js 3.0.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-filter.html'
    },
    fixable: null,
    schema: [],
    messages: {
      noDeprecatedFilter: 'Filters are deprecated.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      KFilterSequenceExpression(node) {
        context.report({
          node,
          loc: node.loc,
          messageId: 'noDeprecatedFilter'
        })
      }
    })
  }
}
