/**
 * @author NKDuy
 * @fileoverview Disallow use of deprecated `.sync` modifier on `k-bind` directive (in Kdu.js 3.0.0+)
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
        'disallow use of deprecated `.sync` modifier on `k-bind` directive (in Kdu.js 3.0.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-k-bind-sync.html'
    },
    fixable: 'code',
    schema: [],
    messages: {
      syncModifierIsDeprecated:
        "'.sync' modifier on 'k-bind' directive is deprecated. Use 'k-model:propName' instead."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name.name='bind']"(node) {
        if (node.key.modifiers.map((mod) => mod.name).includes('sync')) {
          context.report({
            node,
            loc: node.loc,
            messageId: 'syncModifierIsDeprecated',
            fix(fixer) {
              if (node.key.argument == null) {
                // is using spread syntax
                return null
              }
              if (node.key.modifiers.length > 1) {
                // has multiple modifiers
                return null
              }

              const bindArgument = context
                .getSourceCode()
                .getText(node.key.argument)
              return fixer.replaceText(node.key, `k-model:${bindArgument}`)
            }
          })
        }
      }
    })
  }
}
