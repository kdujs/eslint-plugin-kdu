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
      description: 'enforce `k-on` directive style',
      category: 'strongly-recommended',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/k-on-style.md'
    },
    fixable: 'code',
    schema: [
      { enum: ['shorthand', 'longform'] }
    ]
  },

  create (context) {
    const shorthand = context.options[0] !== 'longform'

    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name='on'][key.argument!=null]" (node) {
        if (node.key.shorthand === shorthand) {
          return
        }

        const pos = node.range[0]
        context.report({
          node,
          loc: node.loc,
          message: shorthand
            ? "Expected '@' instead of 'k-on:'."
            : "Expected 'k-on:' instead of '@'.",
          fix: (fixer) => shorthand
            ? fixer.replaceTextRange([pos, pos + 5], '@')
            : fixer.replaceTextRange([pos, pos + 1], 'k-on:')
        })
      }
    })
  }
}
