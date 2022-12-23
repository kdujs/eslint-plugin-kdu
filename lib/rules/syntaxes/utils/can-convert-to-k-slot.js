/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const utils = require('../../../utils')
/**
 * @typedef {object} SlotKForVariables
 * @property {KForExpression} expr
 * @property {KVariable[]} variables
 */
/**
 * @typedef {object} SlotContext
 * @property {KElement} element
 * @property {KAttribute | KDirective | null} slot
 * @property {KDirective | null} kFor
 * @property {SlotKForVariables | null} slotKForVars
 * @property {string} normalizedName
 */
/**
 * Checks whether the given element can use k-slot.
 * @param {KElement} element
 * @param {SourceCode} sourceCode
 * @param {ParserServices.TokenStore} tokenStore
 */
module.exports = function canConvertToKSlot(element, sourceCode, tokenStore) {
  if (element.name !== 'template') {
    return false
  }
  const ownerElement = element.parent
  if (
    ownerElement.type === 'KDocumentFragment' ||
    !utils.isCustomComponent(ownerElement)
  ) {
    return false
  }
  const slot = getSlotContext(element, sourceCode)
  if (slot.kFor && !slot.slotKForVars) {
    // E.g., <template k-for="x of xs" #one></template>
    return false
  }
  if (hasSameSlotDirective(ownerElement, slot, sourceCode, tokenStore)) {
    return false
  }
  return true
}
/**
 * @param {KElement} element
 * @param {SourceCode} sourceCode
 * @returns {SlotContext}
 */
function getSlotContext(element, sourceCode) {
  const slot =
    utils.getAttribute(element, 'slot') ||
    utils.getDirective(element, 'bind', 'slot')
  const kFor = utils.getDirective(element, 'for')
  const slotKForVars = getSlotKForVariableIfUsingIterationVars(slot, kFor)

  return {
    element,
    slot,
    kFor,
    slotKForVars,
    normalizedName: getNormalizedName(slot, sourceCode)
  }
}

/**
 * Gets the `k-for` directive and variable that provide the variables used by the given `slot` attribute.
 * @param {KAttribute | KDirective | null} slot The current `slot` attribute node.
 * @param {KDirective | null} [kFor] The current `k-for` directive node.
 * @returns { SlotKForVariables | null } The SlotKForVariables.
 */
function getSlotKForVariableIfUsingIterationVars(slot, kFor) {
  if (!slot || !slot.directive) {
    return null
  }
  const expr =
    kFor && kFor.value && /** @type {KForExpression} */ (kFor.value.expression)
  const variables =
    expr && getUsingIterationVars(slot.value, slot.parent.parent)
  return expr && variables && variables.length ? { expr, variables } : null
}

/**
 * Gets iterative variables if a given expression node is using iterative variables that the element defined.
 * @param {KExpressionContainer|null} expression The expression node to check.
 * @param {KElement} element The element node which has the expression.
 * @returns {KVariable[]} The expression node is using iteration variables.
 */
function getUsingIterationVars(expression, element) {
  const vars = []
  if (expression && expression.type === 'KExpressionContainer') {
    for (const { variable } of expression.references) {
      if (
        variable != null &&
        variable.kind === 'k-for' &&
        variable.id.range[0] > element.startTag.range[0] &&
        variable.id.range[1] < element.startTag.range[1]
      ) {
        vars.push(variable)
      }
    }
  }
  return vars
}

/**
 * Get the normalized name of a given `slot` attribute node.
 * @param {KAttribute | KDirective | null} slotAttr node of `slot`
 * @param {SourceCode} sourceCode The source code.
 * @returns {string} The normalized name.
 */
function getNormalizedName(slotAttr, sourceCode) {
  if (!slotAttr) {
    return 'default'
  }
  if (!slotAttr.directive) {
    return slotAttr.value ? slotAttr.value.value : 'default'
  }
  return slotAttr.value ? `[${sourceCode.getText(slotAttr.value)}]` : '[null]'
}

/**
 * Checks whether parent element has the same slot as the given slot.
 * @param {KElement} ownerElement The parent element.
 * @param {SlotContext} targetSlot The SlotContext with a slot to check if they are the same.
 * @param {SourceCode} sourceCode
 * @param {ParserServices.TokenStore} tokenStore
 */
function hasSameSlotDirective(
  ownerElement,
  targetSlot,
  sourceCode,
  tokenStore
) {
  for (const group of utils.iterateChildElementsChains(ownerElement)) {
    if (group.includes(targetSlot.element)) {
      continue
    }
    for (const childElement of group) {
      const slot = getSlotContext(childElement, sourceCode)
      if (!targetSlot.slotKForVars || !slot.slotKForVars) {
        if (
          !targetSlot.slotKForVars &&
          !slot.slotKForVars &&
          targetSlot.normalizedName === slot.normalizedName
        ) {
          return true
        }
        continue
      }
      if (
        equalSlotKForVariables(
          targetSlot.slotKForVars,
          slot.slotKForVars,
          tokenStore
        )
      ) {
        return true
      }
    }
  }
  return false
}

/**
 * Determines whether the two given `k-slot` variables are considered to be equal.
 * @param {SlotKForVariables} a First element.
 * @param {SlotKForVariables} b Second element.
 * @param {ParserServices.TokenStore} tokenStore The token store.
 * @returns {boolean} `true` if the elements are considered to be equal.
 */
function equalSlotKForVariables(a, b, tokenStore) {
  if (a.variables.length !== b.variables.length) {
    return false
  }
  if (!equal(a.expr.right, b.expr.right)) {
    return false
  }

  const checkedVarNames = new Set()
  const len = Math.min(a.expr.left.length, b.expr.left.length)
  for (let index = 0; index < len; index++) {
    const aPtn = a.expr.left[index]
    const bPtn = b.expr.left[index]

    const aVar = a.variables.find(
      (v) => aPtn.range[0] <= v.id.range[0] && v.id.range[1] <= aPtn.range[1]
    )
    const bVar = b.variables.find(
      (v) => bPtn.range[0] <= v.id.range[0] && v.id.range[1] <= bPtn.range[1]
    )
    if (aVar && bVar) {
      if (aVar.id.name !== bVar.id.name) {
        return false
      }
      if (!equal(aPtn, bPtn)) {
        return false
      }
      checkedVarNames.add(aVar.id.name)
    } else if (aVar || bVar) {
      return false
    }
  }
  for (const v of a.variables) {
    if (!checkedVarNames.has(v.id.name)) {
      if (b.variables.every((bv) => v.id.name !== bv.id.name)) {
        return false
      }
    }
  }
  return true

  /**
   * Determines whether the two given nodes are considered to be equal.
   * @param {ASTNode} a First node.
   * @param {ASTNode} b Second node.
   * @returns {boolean} `true` if the nodes are considered to be equal.
   */
  function equal(a, b) {
    if (a.type !== b.type) {
      return false
    }
    return utils.equalTokens(a, b, tokenStore)
  }
}
