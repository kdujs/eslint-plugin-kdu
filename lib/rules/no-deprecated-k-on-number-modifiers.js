/**
 * @fileoverview disallow using deprecated number (keycode) modifiers
 * @author NKDuy
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')
const keyCodeToKey = require('../utils/keycode-to-key')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'disallow using deprecated number (keycode) modifiers (in Kdu.js 3.0.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-k-on-number-modifiers.html'
    },
    fixable: 'code',
    schema: [],
    messages: {
      numberModifierIsDeprecated:
        "'KeyboardEvent.keyCode' modifier on 'k-on' directive is deprecated. Using 'KeyboardEvent.key' instead."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirectiveKey} node */
      "KAttribute[directive=true][key.name.name='on'] > KDirectiveKey"(node) {
        const modifier = node.modifiers.find((mod) =>
          Number.isInteger(parseInt(mod.name, 10))
        )
        if (!modifier) return

        const keyCodes = parseInt(modifier.name, 10)
        if (keyCodes > 9 || keyCodes < 0) {
          context.report({
            node: modifier,
            messageId: 'numberModifierIsDeprecated',
            fix(fixer) {
              const key = keyCodeToKey[keyCodes]
              if (!key) return null

              return fixer.replaceText(modifier, `${key}`)
            }
          })
        }
      }
    })
  }
}
