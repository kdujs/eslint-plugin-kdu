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
    type: 'suggestion',
    docs: {
      description: 'enforce `k-on` directive style',
      categories: ['kdu3-strongly-recommended', 'strongly-recommended'],
      url: 'https://kdujs-eslint.web.app/rules/k-on-style.html'
    },
    fixable: 'code',
    schema: [{ enum: ['shorthand', 'longform'] }]
  },
  /** @param {RuleContext} context */
  create(context) {
    const preferShorthand = context.options[0] !== 'longform'

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='on'][key.argument!=null]"(
        node
      ) {
        const shorthand = node.key.name.rawName === '@'
        if (shorthand === preferShorthand) {
          return
        }

        const pos = node.range[0]
        context.report({
          node,
          loc: node.loc,
          message: preferShorthand
            ? "Expected '@' instead of 'k-on:'."
            : "Expected 'k-on:' instead of '@'.",
          fix: (fixer) =>
            preferShorthand
              ? fixer.replaceTextRange([pos, pos + 5], '@')
              : fixer.replaceTextRange([pos, pos + 1], 'k-on:')
        })
      }
    })
  }
}
