/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const { pascalCase } = require('../utils/casing')
const utils = require('../utils')

/**
 * @typedef {Object} Options
 * @property {"shorthand" | "longform" | "k-slot"} atComponent The style for the default slot at a custom component directly.
 * @property {"shorthand" | "longform" | "k-slot"} default The style for the default slot at a template wrapper.
 * @property {"shorthand" | "longform"} named The style for named slots at a template wrapper.
 */

/**
 * Normalize options.
 * @param {any} options The raw options to normalize.
 * @returns {Options} The normalized options.
 */
function normalizeOptions(options) {
  /** @type {Options} */
  const normalized = {
    atComponent: 'k-slot',
    default: 'shorthand',
    named: 'shorthand'
  }

  if (typeof options === 'string') {
    normalized.atComponent =
      normalized.default =
      normalized.named =
        /** @type {"shorthand" | "longform"} */ (options)
  } else if (options != null) {
    /** @type {(keyof Options)[]} */
    const keys = ['atComponent', 'default', 'named']
    for (const key of keys) {
      if (options[key] != null) {
        normalized[key] = options[key]
      }
    }
  }

  return normalized
}

/**
 * Get the expected style.
 * @param {Options} options The options that defined expected types.
 * @param {KDirective} node The `k-slot` node to check.
 * @returns {"shorthand" | "longform" | "k-slot"} The expected style.
 */
function getExpectedStyle(options, node) {
  const { argument } = node.key

  if (
    argument == null ||
    (argument.type === 'KIdentifier' && argument.name === 'default')
  ) {
    const element = node.parent.parent
    return element.name === 'template' ? options.default : options.atComponent
  }
  return options.named
}

/**
 * Get the expected style.
 * @param {KDirective} node The `k-slot` node to check.
 * @returns {"shorthand" | "longform" | "k-slot"} The expected style.
 */
function getActualStyle(node) {
  const { name, argument } = node.key

  if (name.rawName === '#') {
    return 'shorthand'
  }
  if (argument != null) {
    return 'longform'
  }
  return 'k-slot'
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce `k-slot` directive style',
      categories: ['kdu3-strongly-recommended', 'strongly-recommended'],
      url: 'https://kdujs-eslint.web.app/rules/k-slot-style.html'
    },
    fixable: 'code',
    schema: [
      {
        anyOf: [
          { enum: ['shorthand', 'longform'] },
          {
            type: 'object',
            properties: {
              atComponent: { enum: ['shorthand', 'longform', 'k-slot'] },
              default: { enum: ['shorthand', 'longform', 'k-slot'] },
              named: { enum: ['shorthand', 'longform'] }
            },
            additionalProperties: false
          }
        ]
      }
    ],
    messages: {
      expectedShorthand: "Expected '#{{argument}}' instead of '{{actual}}'.",
      expectedLongform:
        "Expected 'k-slot:{{argument}}' instead of '{{actual}}'.",
      expectedKSlot: "Expected 'k-slot' instead of '{{actual}}'."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const sourceCode = context.getSourceCode()
    const options = normalizeOptions(context.options[0])

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='slot']"(node) {
        const expected = getExpectedStyle(options, node)
        const actual = getActualStyle(node)
        if (actual === expected) {
          return
        }

        const { name, argument } = node.key
        /** @type {Range} */
        const range = [name.range[0], (argument || name).range[1]]
        const argumentText = argument ? sourceCode.getText(argument) : 'default'
        context.report({
          node,
          messageId: `expected${pascalCase(expected)}`,
          data: {
            actual: sourceCode.text.slice(range[0], range[1]),
            argument: argumentText
          },

          fix(fixer) {
            switch (expected) {
              case 'shorthand':
                return fixer.replaceTextRange(range, `#${argumentText}`)
              case 'longform':
                return fixer.replaceTextRange(range, `k-slot:${argumentText}`)
              case 'k-slot':
                return fixer.replaceTextRange(range, 'k-slot')
              default:
                return null
            }
          }
        })
      }
    })
  }
}
