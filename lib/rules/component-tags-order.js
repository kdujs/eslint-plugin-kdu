/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')
const { parseSelector } = require('../utils/selector')

/**
 * @typedef {import('../utils/selector').KElementSelector} KElementSelector
 */

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const DEFAULT_ORDER = Object.freeze([['script', 'template'], 'style'])

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce order of component top-level elements',
      categories: ['kdu3-recommended', 'recommended'],
      url: 'https://kdujs-eslint.web.app/rules/component-tags-order.html'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          order: {
            type: 'array',
            items: {
              anyOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' }, uniqueItems: true }
              ]
            },
            uniqueItems: true,
            additionalItems: false
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpected:
        "'<{{elementName}}{{elementAttributes}}>' should be above '<{{firstUnorderedName}}{{firstUnorderedAttributes}}>' on line {{line}}."
    }
  },
  /**
   * @param {RuleContext} context - The rule context.
   * @returns {RuleListener} AST event handlers.
   */
  create(context) {
    /**
     * @typedef {object} OrderElement
     * @property {string} selectorText
     * @property {KElementSelector} selector
     * @property {number} index
     */
    /** @type {OrderElement[]} */
    const orders = []
    /** @type {(string|string[])[]} */
    const orderOptions =
      (context.options[0] && context.options[0].order) || DEFAULT_ORDER
    orderOptions.forEach((selectorOrSelectors, index) => {
      if (Array.isArray(selectorOrSelectors)) {
        for (const selector of selectorOrSelectors) {
          orders.push({
            selectorText: selector,
            selector: parseSelector(selector, context),
            index
          })
        }
      } else {
        orders.push({
          selectorText: selectorOrSelectors,
          selector: parseSelector(selectorOrSelectors, context),
          index
        })
      }
    })

    /**
     * @param {KElement} element
     * @return {string}
     */
    function getAttributeString(element) {
      return element.startTag.attributes
        .map((attribute) => {
          if (attribute.value && attribute.value.type !== 'KLiteral') {
            return ''
          }

          return `${attribute.key.name}${
            attribute.value && attribute.value.value
              ? `=${attribute.value.value}`
              : ''
          }`
        })
        .join(' ')
    }

    /**
     * @param {KElement} element
     */
    function getOrderElement(element) {
      return orders.find((o) => o.selector.test(element))
    }
    const documentFragment =
      context.parserServices.getDocumentFragment &&
      context.parserServices.getDocumentFragment()

    function getTopLevelHTMLElements() {
      if (documentFragment) {
        return documentFragment.children.filter(utils.isKElement)
      }
      return []
    }

    return {
      Program(node) {
        if (utils.hasInvalidEOF(node)) {
          return
        }
        const elements = getTopLevelHTMLElements()

        const elementWithOrders = elements.flatMap((element) => {
          const order = getOrderElement(element)
          return order ? [{ order, element }] : []
        })
        const sourceCode = context.getSourceCode()
        elementWithOrders.forEach(({ order: expected, element }, index) => {
          const firstUnordered = elementWithOrders
            .slice(0, index)
            .filter(({ order }) => expected.index < order.index)
            .sort((e1, e2) => e1.order.index - e2.order.index)[0]
          if (firstUnordered) {
            const firstUnorderedAttributes = getAttributeString(
              firstUnordered.element
            )
            const elementAttributes = getAttributeString(element)

            context.report({
              node: element,
              loc: element.loc,
              messageId: 'unexpected',
              data: {
                elementName: element.name,
                elementAttributes: elementAttributes
                  ? ` ${elementAttributes}`
                  : '',
                firstUnorderedName: firstUnordered.element.name,
                firstUnorderedAttributes: firstUnorderedAttributes
                  ? ` ${firstUnorderedAttributes}`
                  : '',
                line: firstUnordered.element.loc.start.line
              },
              *fix(fixer) {
                // insert element before firstUnordered
                const fixedElements = elements.flatMap((it) => {
                  if (it === firstUnordered.element) {
                    return [element, it]
                  } else if (it === element) {
                    return []
                  }
                  return [it]
                })
                for (let i = elements.length - 1; i >= 0; i--) {
                  if (elements[i] !== fixedElements[i]) {
                    yield fixer.replaceTextRange(
                      elements[i].range,
                      sourceCode.text.slice(...fixedElements[i].range)
                    )
                  }
                }
              }
            })
          }
        })
      }
    }
  }
}
