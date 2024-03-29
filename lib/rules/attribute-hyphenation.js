/**
 * @fileoverview Define a style for the props casing in templates.
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')
const casing = require('../utils/casing')
const svgAttributes = require('../utils/svg-attributes-weird-case.json')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'enforce attribute naming style on custom components in template',
      categories: ['kdu3-strongly-recommended', 'strongly-recommended'],
      url: 'https://kdujs-eslint.web.app/rules/attribute-hyphenation.html'
    },
    fixable: 'code',
    schema: [
      {
        enum: ['always', 'never']
      },
      {
        type: 'object',
        properties: {
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
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    const sourceCode = context.getSourceCode()
    const option = context.options[0]
    const optionsPayload = context.options[1]
    const useHyphenated = option !== 'never'
    let ignoredAttributes = ['data-', 'aria-', 'slot-scope'].concat(
      svgAttributes
    )

    if (optionsPayload && optionsPayload.ignore) {
      ignoredAttributes = ignoredAttributes.concat(optionsPayload.ignore)
    }

    const caseConverter = casing.getExactConverter(
      useHyphenated ? 'kebab-case' : 'camelCase'
    )

    /**
     * @param {KDirective | KAttribute} node
     * @param {string} name
     */
    function reportIssue(node, name) {
      const text = sourceCode.getText(node.key)

      context.report({
        node: node.key,
        loc: node.loc,
        message: useHyphenated
          ? "Attribute '{{text}}' must be hyphenated."
          : "Attribute '{{text}}' can't be hyphenated.",
        data: {
          text
        },
        fix: (fixer) =>
          fixer.replaceText(node.key, text.replace(name, caseConverter(name)))
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

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return utils.defineTemplateBodyVisitor(context, {
      KAttribute(node) {
        if (!utils.isCustomComponent(node.parent.parent)) return

        const name = !node.directive
          ? node.key.rawName
          : node.key.name.name === 'bind'
          ? node.key.argument &&
            node.key.argument.type === 'KIdentifier' &&
            node.key.argument.rawName
          : /* otherwise */ false
        if (!name || isIgnoredAttribute(name)) return

        reportIssue(node, name)
      }
    })
  }
}
