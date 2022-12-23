/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const utils = require('../utils')
const regexp = require('../utils/regexp')
/**
 * @typedef {object} ParsedOption
 * @property { (key: KDirectiveKey) => boolean } test
 * @property {string[]} modifiers
 * @property {boolean} [useElement]
 * @property {string} [message]
 */

const DEFAULT_OPTIONS = [
  {
    argument: '/^k-/',
    message:
      'Using `:k-xxx` is not allowed. Instead, remove `:` and use it as directive.'
  }
]

/**
 * @param {string} str
 * @returns {(str: string) => boolean}
 */
function buildMatcher(str) {
  if (regexp.isRegExp(str)) {
    const re = regexp.toRegExp(str)
    return (s) => {
      re.lastIndex = 0
      return re.test(s)
    }
  }
  return (s) => s === str
}
/**
 * @param {any} option
 * @returns {ParsedOption}
 */
function parseOption(option) {
  if (typeof option === 'string') {
    const matcher = buildMatcher(option)
    return {
      test(key) {
        return Boolean(
          key.argument &&
            key.argument.type === 'KIdentifier' &&
            matcher(key.argument.rawName)
        )
      },
      modifiers: []
    }
  }
  if (option === null) {
    return {
      test(key) {
        return key.argument === null
      },
      modifiers: []
    }
  }
  const parsed = parseOption(option.argument)
  if (option.modifiers) {
    const argTest = parsed.test
    parsed.test = (key) => {
      if (!argTest(key)) {
        return false
      }
      return /** @type {string[]} */ (option.modifiers).every((modName) => {
        return key.modifiers.some((mid) => mid.name === modName)
      })
    }
    parsed.modifiers = option.modifiers
  }
  if (option.element) {
    const argTest = parsed.test
    const tagMatcher = buildMatcher(option.element)
    parsed.test = (key) => {
      if (!argTest(key)) {
        return false
      }
      const element = key.parent.parent.parent
      return tagMatcher(element.rawName)
    }
    parsed.useElement = true
  }
  parsed.message = option.message
  return parsed
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow specific argument in `k-bind`',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-restricted-k-bind.html'
    },
    fixable: null,
    schema: {
      type: 'array',
      items: {
        oneOf: [
          { type: ['string', 'null'] },
          {
            type: 'object',
            properties: {
              argument: { type: ['string', 'null'] },
              modifiers: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['prop', 'camel', 'sync', 'attr']
                },
                uniqueItems: true
              },
              element: { type: 'string' },
              message: { type: 'string', minLength: 1 }
            },
            required: ['argument'],
            additionalProperties: false
          }
        ]
      },
      uniqueItems: true,
      minItems: 0
    },

    messages: {
      // eslint-disable-next-line eslint-plugin/report-message-format
      restrictedKBind: '{{message}}'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @type {ParsedOption[]} */
    const options = (
      context.options.length === 0 ? DEFAULT_OPTIONS : context.options
    ).map(parseOption)

    return utils.defineTemplateBodyVisitor(context, {
      /**
       * @param {KDirectiveKey} node
       */
      "KAttribute[directive=true][key.name.name='bind'] > KDirectiveKey"(node) {
        for (const option of options) {
          if (option.test(node)) {
            const message = option.message || defaultMessage(node, option)
            context.report({
              node,
              messageId: 'restrictedKBind',
              data: { message }
            })
            return
          }
        }
      }
    })

    /**
     * @param {KDirectiveKey} key
     * @param {ParsedOption} option
     */
    function defaultMessage(key, option) {
      const kbind = key.name.rawName === ':' ? '' : 'k-bind'
      const arg =
        key.argument != null && key.argument.type === 'KIdentifier'
          ? `:${key.argument.rawName}`
          : ''
      const mod = option.modifiers.length
        ? `.${option.modifiers.join('.')}`
        : ''
      let on = ''
      if (option.useElement) {
        on = ` on \`<${key.parent.parent.parent.rawName}>\``
      }
      return `Using \`${kbind + arg + mod}\`${on} is not allowed.`
    }
  }
}
