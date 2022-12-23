/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
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
      description: 'disallow use of k-text',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-k-text.html'
    },
    fixable: null,
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='text']"(node) {
        context.report({
          node,
          loc: node.loc,
          message: "Don't use 'k-text'."
        })
      }
    })
  }
}
