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
    type: 'problem',
    docs: {
      description:
        'disallow using deprecated `Kdu.config.keyCodes` (in Kdu.js 3.0.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-kdu-config-keycodes.html'
    },
    fixable: null,
    schema: [],
    messages: {
      unexpected: '`Kdu.config.keyCodes` are deprecated.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return {
      /** @param {MemberExpression} node */
      "MemberExpression[property.type='Identifier'][property.name='keyCodes']"(
        node
      ) {
        const config = utils.skipChainExpression(node.object)
        if (
          config.type !== 'MemberExpression' ||
          config.property.type !== 'Identifier' ||
          config.property.name !== 'config' ||
          config.object.type !== 'Identifier' ||
          config.object.name !== 'Kdu'
        ) {
          return
        }
        context.report({
          node,
          messageId: 'unexpected'
        })
      }
    }
  }
}
