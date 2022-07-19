/**
 * @fileoverview enforce sort-keys in a manner that is compatible with order-in-components
 * @author NKDuy
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const naturalCompare = require('natural-compare')
const utils = require('../utils')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * Gets the property name of the given `Property` node.
 *
 * - If the property's key is an `Identifier` node, this returns the key's name
 *   whether it's a computed property or not.
 * - If the property has a static name, this returns the static name.
 * - Otherwise, this returns null.
 * @param {Property} node The `Property` node to get.
 * @returns {string|null} The property name or null.
 * @private
 */
function getPropertyName(node) {
  const staticName = utils.getStaticPropertyName(node)

  if (staticName !== null) {
    return staticName
  }

  return node.key.type === 'Identifier' ? node.key.name : null
}

/**
 * Functions which check that the given 2 names are in specific order.
 *
 * Postfix `I` is meant insensitive.
 * Postfix `N` is meant natural.
 * @private
 * @type { { [key: string]: (a:string, b:string) => boolean } }
 */
const isValidOrders = {
  asc(a, b) {
    return a <= b
  },
  ascI(a, b) {
    return a.toLowerCase() <= b.toLowerCase()
  },
  ascN(a, b) {
    return naturalCompare(a, b) <= 0
  },
  ascIN(a, b) {
    return naturalCompare(a.toLowerCase(), b.toLowerCase()) <= 0
  },
  desc(a, b) {
    return isValidOrders.asc(b, a)
  },
  descI(a, b) {
    return isValidOrders.ascI(b, a)
  },
  descN(a, b) {
    return isValidOrders.ascN(b, a)
  },
  descIN(a, b) {
    return isValidOrders.ascIN(b, a)
  }
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'enforce sort-keys in a manner that is compatible with order-in-components',
      categories: null,
      recommended: false,
      url: 'https://kdujs-eslint.web.app/rules/sort-keys.html'
    },
    fixable: null,
    schema: [
      {
        enum: ['asc', 'desc']
      },
      {
        type: 'object',
        properties: {
          caseSensitive: {
            type: 'boolean',
            default: true
          },
          ignoreChildrenOf: {
            type: 'array'
          },
          ignoreGrandchildrenOf: {
            type: 'array'
          },
          minKeys: {
            type: 'integer',
            minimum: 2,
            default: 2
          },
          natural: {
            type: 'boolean',
            default: false
          },
          runOutsideKdu: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      sortKeys:
        "Expected object keys to be in {{natural}}{{insensitive}}{{order}}ending order. '{{thisName}}' should be before '{{prevName}}'."
    }
  },
  /**
   * @param {RuleContext} context - The rule context.
   * @returns {RuleListener} AST event handlers.
   */
  create(context) {
    // Parse options.
    const options = context.options[1]
    const order = context.options[0] || 'asc'

    /** @type {string[]} */
    const ignoreGrandchildrenOf = (options &&
      options.ignoreGrandchildrenOf) || [
      'computed',
      'directives',
      'inject',
      'props',
      'watch'
    ]
    /** @type {string[]} */
    const ignoreChildrenOf = (options && options.ignoreChildrenOf) || ['model']
    const insensitive = options && options.caseSensitive === false
    const minKeys = options && options.minKeys
    const natural = options && options.natural
    const isValidOrder =
      isValidOrders[order + (insensitive ? 'I' : '') + (natural ? 'N' : '')]

    /**
     * @typedef {object} ObjectStack
     * @property {ObjectStack | null} ObjectStack.upper
     * @property {string | null} ObjectStack.prevName
     * @property {number} ObjectStack.numKeys
     * @property {KduState} ObjectStack.kduState
     *
     * @typedef {object} KduState
     * @property {Property} [KduState.currentProperty]
     * @property {boolean} [KduState.isKduObject]
     * @property {boolean} [KduState.within]
     * @property {string} [KduState.propName]
     * @property {number} [KduState.chainLevel]
     * @property {boolean} [KduState.ignore]
     */

    /**
     * The stack to save the previous property's name for each object literals.
     * @type {ObjectStack | null}
     */
    let objectStack

    return {
      ObjectExpression(node) {
        /** @type {KduState} */
        const kduState = {}
        const upperKduState = (objectStack && objectStack.kduState) || {}
        objectStack = {
          upper: objectStack,
          prevName: null,
          numKeys: node.properties.length,
          kduState
        }

        kduState.isKduObject = utils.getKduObjectType(context, node) != null
        if (kduState.isKduObject) {
          kduState.within = kduState.isKduObject
          // Ignore Kdu object properties
          kduState.ignore = true
        } else {
          if (upperKduState.within && upperKduState.currentProperty) {
            const isChain = utils.isPropertyChain(
              upperKduState.currentProperty,
              node
            )
            if (isChain) {
              let propName
              let chainLevel
              if (upperKduState.isKduObject) {
                propName =
                  utils.getStaticPropertyName(upperKduState.currentProperty) ||
                  ''
                chainLevel = 1
              } else {
                propName = upperKduState.propName || ''
                chainLevel = (upperKduState.chainLevel || 0) + 1
              }
              kduState.propName = propName
              kduState.chainLevel = chainLevel
              // chaining
              kduState.within = true

              // Judge whether to ignore the property.
              if (chainLevel === 1) {
                if (ignoreChildrenOf.includes(propName)) {
                  kduState.ignore = true
                }
              } else if (chainLevel === 2) {
                if (ignoreGrandchildrenOf.includes(propName)) {
                  kduState.ignore = true
                }
              }
            } else {
              // chaining has broken.
              kduState.within = false
            }
          }
        }
      },
      'ObjectExpression:exit'() {
        objectStack = objectStack && objectStack.upper
      },
      SpreadElement(node) {
        if (!objectStack) {
          return
        }
        if (node.parent.type === 'ObjectExpression') {
          objectStack.prevName = null
        }
      },
      'ObjectExpression > Property'(node) {
        if (!objectStack) {
          return
        }
        objectStack.kduState.currentProperty = node
        if (objectStack.kduState.ignore) {
          return
        }
        const prevName = objectStack.prevName
        const numKeys = objectStack.numKeys
        const thisName = getPropertyName(node)

        if (thisName !== null) {
          objectStack.prevName = thisName
        }

        if (prevName === null || thisName === null || numKeys < minKeys) {
          return
        }

        if (!isValidOrder(prevName, thisName)) {
          context.report({
            node,
            loc: node.key.loc,
            messageId: 'sortKeys',
            data: {
              thisName,
              prevName,
              order,
              insensitive: insensitive ? 'insensitive ' : '',
              natural: natural ? 'natural ' : ''
            }
          })
        }
      }
    }
  }
}
