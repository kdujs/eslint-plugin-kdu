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
      description: 'enforce valid template root',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/valid-template-root.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    const sourceCode = context.getSourceCode()

    return {
      Program (program) {
        const element = program.templateBody
        if (element == null) {
          return
        }

        const hasSrc = utils.hasAttribute(element, 'src')
        const rootElements = []
        let extraText = null
        let extraElement = null
        let kIf = false
        for (const child of element.children) {
          if (child.type === 'KElement') {
            if (rootElements.length === 0 && !hasSrc) {
              rootElements.push(child)
              kIf = utils.hasDirective(child, 'if')
            } else if (kIf && utils.hasDirective(child, 'else-if')) {
              rootElements.push(child)
            } else if (kIf && utils.hasDirective(child, 'else')) {
              rootElements.push(child)
              kIf = false
            } else {
              extraElement = child
            }
          } else if (sourceCode.getText(child).trim() !== '') {
            extraText = child
          }
        }

        if (hasSrc && (extraText != null || extraElement != null)) {
          context.report({
            node: extraText || extraElement,
            loc: (extraText || extraElement).loc,
            message: "The template root with 'src' attribute is required to be empty."
          })
        } else if (extraText != null) {
          context.report({
            node: extraText,
            loc: extraText.loc,
            message: 'The template root requires an element rather than texts.'
          })
        } else if (extraElement != null) {
          context.report({
            node: extraElement,
            loc: extraElement.loc,
            message: 'The template root requires exactly one element.'
          })
        } else if (rootElements.length === 0 && !hasSrc) {
          context.report({
            node: element,
            loc: element.loc,
            message: 'The template root requires exactly one element.'
          })
        } else {
          for (const element of rootElements) {
            const tag = element.startTag
            const name = element.name

            if (name === 'template' || name === 'slot') {
              context.report({
                node: tag,
                loc: tag.loc,
                message: "The template root disallows '<{{name}}>' elements.",
                data: { name }
              })
            }
            if (utils.hasDirective(element, 'for')) {
              context.report({
                node: tag,
                loc: tag.loc,
                message: "The template root disallows 'k-for' directives."
              })
            }
          }
        }
      }
    }
  }
}
