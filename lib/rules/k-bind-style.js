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
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce `k-bind` directive style',
      category: 'strongly-recommended',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/k-bind-style.md'
    },
    fixable: 'code',
    schema: [
      { enum: ['shorthand', 'longform'] }
    ]
  },

  create (context) {
    const shorthand = context.options[0] !== 'longform'

    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name='bind'][key.argument!=null]" (node) {
        if (node.key.shorthand === shorthand) {
          return
        }

        context.report({
          node,
          loc: node.loc,
          message: shorthand
            ? "Unexpected 'k-bind' before ':'."
            : "Expected 'k-bind' before ':'.",
          fix: (fixer) => shorthand
            ? fixer.removeRange([node.range[0], node.range[0] + 6])
            : fixer.insertTextBefore(node, 'k-bind')
        })
      }
    })
  }
}
