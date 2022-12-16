/**
 * @fileoverview Restrict or warn use of k-html to prevent XSS attack
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
      description: 'disallow use of k-html to prevent XSS attack',
      category: 'recommended',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/no-k-html.md'
    },
    fixable: null,
    schema: []
  },
  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name='html']" (node) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-html' directive can lead to XSS attack."
        })
      }
    })
  }
}
