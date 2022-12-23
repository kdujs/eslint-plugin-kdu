/**
 * @fileoverview enforce ordering of attributes
 * @author NKDuy
 */
'use strict'
const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/**
 * @typedef { KDirective & { key: KDirectiveKey & { name: KIdentifier & { name: 'bind' } } } } KBindDirective
 */

const ATTRS = {
  DEFINITION: 'DEFINITION',
  LIST_RENDERING: 'LIST_RENDERING',
  CONDITIONALS: 'CONDITIONALS',
  RENDER_MODIFIERS: 'RENDER_MODIFIERS',
  GLOBAL: 'GLOBAL',
  UNIQUE: 'UNIQUE',
  SLOT: 'SLOT',
  TWO_WAY_BINDING: 'TWO_WAY_BINDING',
  OTHER_DIRECTIVES: 'OTHER_DIRECTIVES',
  OTHER_ATTR: 'OTHER_ATTR',
  EVENTS: 'EVENTS',
  CONTENT: 'CONTENT'
}

/**
 * Check whether the given attribute is `k-bind` directive.
 * @param {KAttribute | KDirective | undefined | null} node
 * @returns { node is KBindDirective }
 */
function isKBind(node) {
  return Boolean(node && node.directive && node.key.name.name === 'bind')
}
/**
 * Check whether the given attribute is plain attribute.
 * @param {KAttribute | KDirective | undefined | null} node
 * @returns { node is KAttribute }
 */
function isKAttribute(node) {
  return Boolean(node && !node.directive)
}
/**
 * Check whether the given attribute is plain attribute or `k-bind` directive.
 * @param {KAttribute | KDirective | undefined | null} node
 * @returns { node is KAttribute }
 */
function isKAttributeOrKBind(node) {
  return isKAttribute(node) || isKBind(node)
}

/**
 * Check whether the given attribute is `k-bind="..."` directive.
 * @param {KAttribute | KDirective | undefined | null} node
 * @returns { node is KBindDirective }
 */
function isKBindObject(node) {
  return isKBind(node) && node.key.argument == null
}

/**
 * @param {KAttribute | KDirective} attribute
 * @param {SourceCode} sourceCode
 */
function getAttributeName(attribute, sourceCode) {
  if (attribute.directive) {
    if (isKBind(attribute)) {
      return attribute.key.argument
        ? sourceCode.getText(attribute.key.argument)
        : ''
    } else {
      return getDirectiveKeyName(attribute.key, sourceCode)
    }
  } else {
    return attribute.key.name
  }
}

/**
 * @param {KDirectiveKey} directiveKey
 * @param {SourceCode} sourceCode
 */
function getDirectiveKeyName(directiveKey, sourceCode) {
  let text = `k-${directiveKey.name.name}`
  if (directiveKey.argument) {
    text += `:${sourceCode.getText(directiveKey.argument)}`
  }
  for (const modifier of directiveKey.modifiers) {
    text += `.${modifier.name}`
  }
  return text
}

/**
 * @param {KAttribute | KDirective} attribute
 */
function getAttributeType(attribute) {
  let propName
  if (attribute.directive) {
    if (!isKBind(attribute)) {
      const name = attribute.key.name.name
      if (name === 'for') {
        return ATTRS.LIST_RENDERING
      } else if (
        name === 'if' ||
        name === 'else-if' ||
        name === 'else' ||
        name === 'show' ||
        name === 'cloak'
      ) {
        return ATTRS.CONDITIONALS
      } else if (name === 'pre' || name === 'once') {
        return ATTRS.RENDER_MODIFIERS
      } else if (name === 'model') {
        return ATTRS.TWO_WAY_BINDING
      } else if (name === 'on') {
        return ATTRS.EVENTS
      } else if (name === 'html' || name === 'text') {
        return ATTRS.CONTENT
      } else if (name === 'slot') {
        return ATTRS.SLOT
      } else if (name === 'is') {
        return ATTRS.DEFINITION
      } else {
        return ATTRS.OTHER_DIRECTIVES
      }
    }
    propName =
      attribute.key.argument && attribute.key.argument.type === 'KIdentifier'
        ? attribute.key.argument.rawName
        : ''
  } else {
    propName = attribute.key.name
  }
  if (propName === 'is') {
    return ATTRS.DEFINITION
  } else if (propName === 'id') {
    return ATTRS.GLOBAL
  } else if (propName === 'ref' || propName === 'key') {
    return ATTRS.UNIQUE
  } else if (propName === 'slot' || propName === 'slot-scope') {
    return ATTRS.SLOT
  } else {
    return ATTRS.OTHER_ATTR
  }
}

/**
 * @param {KAttribute | KDirective} attribute
 * @param { { [key: string]: number } } attributePosition
 * @returns {number | null} If the value is null, the order is omitted. Do not force the order.
 */
function getPosition(attribute, attributePosition) {
  const attributeType = getAttributeType(attribute)
  return attributePosition[attributeType] != null
    ? attributePosition[attributeType]
    : null
}

/**
 * @param {KAttribute | KDirective} prevNode
 * @param {KAttribute | KDirective} currNode
 * @param {SourceCode} sourceCode
 */
function isAlphabetical(prevNode, currNode, sourceCode) {
  const prevName = getAttributeName(prevNode, sourceCode)
  const currName = getAttributeName(currNode, sourceCode)
  if (prevName === currName) {
    const prevIsBind = isKBind(prevNode)
    const currIsBind = isKBind(currNode)
    return prevIsBind <= currIsBind
  }
  return prevName < currName
}

/**
 * @param {RuleContext} context - The rule context.
 * @returns {RuleListener} AST event handlers.
 */
function create(context) {
  const sourceCode = context.getSourceCode()
  let attributeOrder = [
    ATTRS.DEFINITION,
    ATTRS.LIST_RENDERING,
    ATTRS.CONDITIONALS,
    ATTRS.RENDER_MODIFIERS,
    ATTRS.GLOBAL,
    [ATTRS.UNIQUE, ATTRS.SLOT],
    ATTRS.TWO_WAY_BINDING,
    ATTRS.OTHER_DIRECTIVES,
    ATTRS.OTHER_ATTR,
    ATTRS.EVENTS,
    ATTRS.CONTENT
  ]
  if (context.options[0] && context.options[0].order) {
    attributeOrder = context.options[0].order
  }
  const alphabetical = Boolean(
    context.options[0] && context.options[0].alphabetical
  )

  /** @type { { [key: string]: number } } */
  const attributePosition = {}
  attributeOrder.forEach((item, i) => {
    if (Array.isArray(item)) {
      for (const attr of item) {
        attributePosition[attr] = i
      }
    } else attributePosition[item] = i
  })

  /**
   * @param {KAttribute | KDirective} node
   * @param {KAttribute | KDirective} previousNode
   */
  function reportIssue(node, previousNode) {
    const currentNode = sourceCode.getText(node.key)
    const prevNode = sourceCode.getText(previousNode.key)
    context.report({
      node,
      message: `Attribute "${currentNode}" should go before "${prevNode}".`,
      data: {
        currentNode
      },

      fix(fixer) {
        const attributes = node.parent.attributes

        /** @type { (node: KAttribute | KDirective | undefined) => boolean } */
        let isMoveUp

        if (isKBindObject(node)) {
          // prev, k-bind:foo, k-bind -> k-bind:foo, k-bind, prev
          isMoveUp = isKAttributeOrKBind
        } else if (isKAttributeOrKBind(node)) {
          // prev, k-bind, k-bind:foo -> k-bind, k-bind:foo, prev
          isMoveUp = isKBindObject
        } else {
          isMoveUp = () => false
        }

        const previousNodes = attributes.slice(
          attributes.indexOf(previousNode),
          attributes.indexOf(node)
        )
        const moveNodes = [node]
        for (const node of previousNodes) {
          if (isMoveUp(node)) {
            moveNodes.unshift(node)
          } else {
            moveNodes.push(node)
          }
        }

        return moveNodes.map((moveNode, index) => {
          const text = sourceCode.getText(moveNode)
          return fixer.replaceText(previousNodes[index] || node, text)
        })
      }
    })
  }

  return utils.defineTemplateBodyVisitor(context, {
    KStartTag(node) {
      const attributeAndPositions = getAttributeAndPositionList(node)
      if (attributeAndPositions.length <= 1) {
        return
      }

      let { attr: previousNode, position: previousPosition } =
        attributeAndPositions[0]
      for (let index = 1; index < attributeAndPositions.length; index++) {
        const { attr, position } = attributeAndPositions[index]

        let valid = previousPosition <= position
        if (valid && alphabetical && previousPosition === position) {
          valid = isAlphabetical(previousNode, attr, sourceCode)
        }
        if (valid) {
          previousNode = attr
          previousPosition = position
        } else {
          reportIssue(attr, previousNode)
        }
      }
    }
  })

  /**
   * @param {KStartTag} node
   * @returns { { attr: ( KAttribute | KDirective ), position: number }[] }
   */
  function getAttributeAndPositionList(node) {
    const attributes = node.attributes.filter((node, index, attributes) => {
      if (
        isKBindObject(node) &&
        (isKAttributeOrKBind(attributes[index - 1]) ||
          isKAttributeOrKBind(attributes[index + 1]))
      ) {
        // In Kdu 3, ignore the `k-bind:foo=" ... "` and `k-bind ="object"` syntax
        // as they behave differently if you change the order.
        return false
      }
      return true
    })

    const results = []
    for (let index = 0; index < attributes.length; index++) {
      const attr = attributes[index]
      const position = getPositionFromAttrIndex(index)
      if (position == null) {
        // The omitted order is skipped.
        continue
      }
      results.push({ attr, position })
    }

    return results

    /**
     * @param {number} index
     * @returns {number | null}
     */
    function getPositionFromAttrIndex(index) {
      const node = attributes[index]
      if (isKBindObject(node)) {
        // node is `k-bind ="object"` syntax

        // In Kdu 3, if change the order of `k-bind:foo=" ... "` and `k-bind ="object"`,
        // the behavior will be different, so adjust so that there is no change in behavior.

        const len = attributes.length
        for (let nextIndex = index + 1; nextIndex < len; nextIndex++) {
          const next = attributes[nextIndex]

          if (isKAttributeOrKBind(next) && !isKBindObject(next)) {
            // It is considered to be in the same order as the next bind prop node.
            return getPositionFromAttrIndex(nextIndex)
          }
        }
      }
      return getPosition(node, attributePosition)
    }
  }
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce order of attributes',
      categories: ['kdu3-recommended', 'recommended'],
      url: 'https://kdujs-eslint.web.app/rules/attributes-order.html'
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
                { enum: Object.values(ATTRS) },
                {
                  type: 'array',
                  items: {
                    enum: Object.values(ATTRS),
                    uniqueItems: true,
                    additionalItems: false
                  }
                }
              ]
            },
            uniqueItems: true,
            additionalItems: false
          },
          alphabetical: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ]
  },
  create
}
