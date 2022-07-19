'use strict'

const utils = require('../utils')
const casing = require('../utils/casing')

module.exports = {
  meta: {
    docs: {
      description:
        'enforce k-on event naming style on custom components in template',
      categories: ['kdu3-strongly-recommended'],
      url: 'https://kdujs-eslint.web.app/rules/k-on-event-hyphenation.html'
    },
    fixable: 'code',
    schema: [
      {
        enum: ['always', 'never']
      },
      {
        type: 'object',
        properties: {
          autofix: { type: 'boolean' },
          ignore: {
            type: 'array',
            items: {
              allOf: [
                { type: 'string' },
                { not: { type: 'string', pattern: ':exit$' } },
                { not: { type: 'string', pattern: '^\\s*$' } }
              ]
            },
            uniqueItems: true,
            additionalItems: false
          }
        },
        additionalProperties: false
      }
    ],
    type: 'suggestion'
  },

  /** @param {RuleContext} context */
  create(context) {
    const sourceCode = context.getSourceCode()
    const option = context.options[0]
    const optionsPayload = context.options[1]
    const useHyphenated = option !== 'never'
    /** @type {string[]} */
    const ignoredAttributes = (optionsPayload && optionsPayload.ignore) || []
    const autofix = Boolean(optionsPayload && optionsPayload.autofix)

    const caseConverter = casing.getConverter(
      useHyphenated ? 'kebab-case' : 'camelCase'
    )

    /**
     * @param {KDirective} node
     * @param {KIdentifier} argument
     * @param {string} name
     */
    function reportIssue(node, argument, name) {
      const text = sourceCode.getText(node.key)

      context.report({
        node: node.key,
        loc: node.loc,
        message: useHyphenated
          ? "k-on event '{{text}}' must be hyphenated."
          : "k-on event '{{text}}' can't be hyphenated.",
        data: {
          text
        },
        fix:
          autofix &&
          // It cannot be converted in snake_case.
          !name.includes('_')
            ? (fixer) => {
                return fixer.replaceText(argument, caseConverter(name))
              }
            : null
      })
    }

    /**
     * @param {string} value
     */
    function isIgnoredAttribute(value) {
      const isIgnored = ignoredAttributes.some((attr) => {
        return value.includes(attr)
      })

      if (isIgnored) {
        return true
      }

      return useHyphenated ? value.toLowerCase() === value : !/-/.test(value)
    }

    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name.name='on']"(node) {
        if (!utils.isCustomComponent(node.parent.parent)) return
        if (!node.key.argument || node.key.argument.type !== 'KIdentifier') {
          return
        }
        const name = node.key.argument.rawName
        if (!name || isIgnoredAttribute(name)) return

        reportIssue(node, node.key.argument, name)
      }
    })
  }
}
