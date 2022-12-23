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
    type: 'problem',
    docs: {
      description:
        'disallow using deprecated `.native` modifiers (in Kdu.js 3.0.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-k-on-native-modifier.html'
    },
    fixable: null,
    schema: [],
    messages: {
      deprecated: "'.native' modifier on 'k-on' directive is deprecated."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KIdentifier & {parent:KDirectiveKey} } node */
      "KAttribute[directive=true][key.name.name='on'] > KDirectiveKey > KIdentifier[name='native']"(
        node
      ) {
        const key = node.parent
        if (!key.modifiers.includes(node)) return

        context.report({
          node,
          messageId: 'deprecated'
        })
      }
    })
  }
}
