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
      categories: ['kdu3-recommended', 'recommended'],
      url: 'https://kdujs-eslint.web.app/rules/no-k-html.html'
    },
    fixable: null,
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='html']"(node) {
        context.report({
          node,
          loc: node.loc,
          message: "'k-html' directive can lead to XSS attack."
        })
      }
    })
  }
}
