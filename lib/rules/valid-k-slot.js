/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const utils = require('../utils')

/**
 * @typedef { { expr: KForExpression, variables: KVariable[] } } KSlotKForVariables
 */

/**
 * Get all `k-slot` directives on a given element.
 * @param {KElement} node The KElement node to check.
 * @returns {KDirective[]} The array of `k-slot` directives.
 */
function getSlotDirectivesOnElement(node) {
  return utils.getDirectives(node, 'slot')
}

/**
 * Get all `k-slot` directives on the children of a given element.
 * @param {KElement} node The KElement node to check.
 * @returns {KDirective[][]}
 * The array of the group of `k-slot` directives.
 * The group bundles `k-slot` directives of element sequence which is connected
 * by `k-if`/`k-else-if`/`k-else`.
 */
function getSlotDirectivesOnChildren(node) {
  /** @type {KDirective[][]} */
  const groups = []
  for (const group of utils.iterateChildElementsChains(node)) {
    const slotDirs = group
      .map((childElement) =>
        childElement.name === 'template'
          ? utils.getDirective(childElement, 'slot')
          : null
      )
      .filter(utils.isDef)
    if (slotDirs.length > 0) {
      groups.push(slotDirs)
    }
  }

  return groups
}

/**
 * Get the normalized name of a given `k-slot` directive node with modifiers after `k-slot:` directive.
 * @param {KDirective} node The `k-slot` directive node.
 * @param {SourceCode} sourceCode The source code.
 * @returns {string} The normalized name.
 */
function getNormalizedName(node, sourceCode) {
  if (node.key.argument == null) {
    return 'default'
  }
  return node.key.modifiers.length === 0
    ? sourceCode.getText(node.key.argument)
    : sourceCode.text.slice(node.key.argument.range[0], node.key.range[1])
}

/**
 * Get all `k-slot` directives which are distributed to the same slot as a given `k-slot` directive node.
 * @param {KDirective[][]} kSlotGroups The result of `getAllNamedSlotElements()`.
 * @param {KDirective} currentKSlot The current `k-slot` directive node.
 * @param {KSlotKForVariables | null} currentKSlotKForVars The current `k-for` variables.
 * @param {SourceCode} sourceCode The source code.
 * @param {ParserServices.TokenStore} tokenStore The token store.
 * @returns {KDirective[][]} The array of the group of `k-slot` directives.
 */
function filterSameSlot(
  kSlotGroups,
  currentKSlot,
  currentKSlotKForVars,
  sourceCode,
  tokenStore
) {
  const currentName = getNormalizedName(currentKSlot, sourceCode)
  return kSlotGroups
    .map((kSlots) =>
      kSlots.filter((kSlot) => {
        if (getNormalizedName(kSlot, sourceCode) !== currentName) {
          return false
        }
        const kForExpr = getKSlotKForVariableIfUsingIterationVars(
          kSlot,
          utils.getDirective(kSlot.parent.parent, 'for')
        )
        if (!currentKSlotKForVars || !kForExpr) {
          return !currentKSlotKForVars && !kForExpr
        }
        if (
          !equalKSlotKForVariables(currentKSlotKForVars, kForExpr, tokenStore)
        ) {
          return false
        }
        //
        return true
      })
    )
    .filter((slots) => slots.length >= 1)
}

/**
 * Determines whether the two given `k-slot` variables are considered to be equal.
 * @param {KSlotKForVariables} a First element.
 * @param {KSlotKForVariables} b Second element.
 * @param {ParserServices.TokenStore} tokenStore The token store.
 * @returns {boolean} `true` if the elements are considered to be equal.
 */
function equalKSlotKForVariables(a, b, tokenStore) {
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

/**
 * Gets the `k-for` directive and variable that provide the variables used by the given` k-slot` directive.
 * @param {KDirective} kSlot The current `k-slot` directive node.
 * @param {KDirective | null} [kFor] The current `k-for` directive node.
 * @returns { KSlotKForVariables | null } The KSlotKForVariable.
 */
function getKSlotKForVariableIfUsingIterationVars(kSlot, kFor) {
  const expr =
    kFor && kFor.value && /** @type {KForExpression} */ (kFor.value.expression)
  const variables =
    expr && getUsingIterationVars(kSlot.key.argument, kSlot.parent.parent)
  return expr && variables && variables.length ? { expr, variables } : null
}

/**
 * Gets iterative variables if a given argument node is using iterative variables that the element defined.
 * @param {KExpressionContainer|KIdentifier|null} argument The argument node to check.
 * @param {KElement} element The element node which has the argument.
 * @returns {KVariable[]} The argument node is using iteration variables.
 */
function getUsingIterationVars(argument, element) {
  const vars = []
  if (argument && argument.type === 'KExpressionContainer') {
    for (const { variable } of argument.references) {
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
 * Check whether a given argument node is using an scope variable that the directive defined.
 * @param {KDirective} kSlot The `k-slot` directive to check.
 * @returns {boolean} `true` if that argument node is using a scope variable the directive defined.
 */
function isUsingScopeVar(kSlot) {
  const argument = kSlot.key.argument
  const value = kSlot.value

  if (argument && value && argument.type === 'KExpressionContainer') {
    for (const { variable } of argument.references) {
      if (
        variable != null &&
        variable.kind === 'scope' &&
        variable.id.range[0] > value.range[0] &&
        variable.id.range[1] < value.range[1]
      ) {
        return true
      }
    }
  }
  return false
}

/**
 * If `allowModifiers` option is set to `true`, check whether a given argument node has invalid modifiers like `k-slot.foo`.
 * Otherwise, check whether a given argument node has at least one modifier.
 * @param {KDirective} kSlot The `k-slot` directive to check.
 * @param {boolean} allowModifiers `allowModifiers` option in context.
 * @return {boolean} `true` if that argument node has invalid modifiers like `k-slot.foo`.
 */
function hasInvalidModifiers(kSlot, allowModifiers) {
  return allowModifiers
    ? kSlot.key.argument == null && kSlot.key.modifiers.length >= 1
    : kSlot.key.modifiers.length >= 1
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce valid `k-slot` directives',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/valid-k-slot.html'
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowModifiers: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      ownerMustBeCustomElement:
        "'k-slot' directive must be owned by a custom element, but '{{name}}' is not.",
      namedSlotMustBeOnTemplate:
        "Named slots must use '<template>' on a custom element.",
      defaultSlotMustBeOnTemplate:
        "Default slot must use '<template>' on a custom element when there are other named slots.",
      disallowDuplicateSlotsOnElement:
        "An element cannot have multiple 'k-slot' directives.",
      disallowDuplicateSlotsOnChildren:
        "An element cannot have multiple '<template>' elements which are distributed to the same slot.",
      disallowArgumentUseSlotParams:
        "Dynamic argument of 'k-slot' directive cannot use that slot parameter.",
      disallowAnyModifier: "'k-slot' directive doesn't support any modifier.",
      requireAttributeValue:
        "'k-slot' directive on a custom element requires that attribute value."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const sourceCode = context.getSourceCode()
    const tokenStore =
      context.parserServices.getTemplateBodyTokenStore &&
      context.parserServices.getTemplateBodyTokenStore()
    const options = context.options[0] || {}
    const allowModifiers = options.allowModifiers === true

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='slot']"(node) {
        const isDefaultSlot =
          node.key.argument == null ||
          (node.key.argument.type === 'KIdentifier' &&
            node.key.argument.name === 'default')
        const element = node.parent.parent
        const parentElement = element.parent
        const ownerElement =
          element.name === 'template' ? parentElement : element
        if (ownerElement.type === 'KDocumentFragment') {
          return
        }
        const kSlotsOnElement = getSlotDirectivesOnElement(element)
        const kSlotGroupsOnChildren = getSlotDirectivesOnChildren(ownerElement)

        // Verify location.
        if (!utils.isCustomComponent(ownerElement)) {
          context.report({
            node,
            messageId: 'ownerMustBeCustomElement',
            data: { name: ownerElement.rawName }
          })
        }
        if (!isDefaultSlot && element.name !== 'template') {
          context.report({
            node,
            messageId: 'namedSlotMustBeOnTemplate'
          })
        }
        if (ownerElement === element && kSlotGroupsOnChildren.length >= 1) {
          context.report({
            node,
            messageId: 'defaultSlotMustBeOnTemplate'
          })
        }

        // Verify duplication.
        if (kSlotsOnElement.length >= 2 && kSlotsOnElement[0] !== node) {
          // E.g., <my-component #one #two>
          context.report({
            node,
            messageId: 'disallowDuplicateSlotsOnElement'
          })
        }
        if (ownerElement === parentElement) {
          const kFor = utils.getDirective(element, 'for')
          const kSlotKForVar = getKSlotKForVariableIfUsingIterationVars(
            node,
            kFor
          )
          const kSlotGroupsOfSameSlot = filterSameSlot(
            kSlotGroupsOnChildren,
            node,
            kSlotKForVar,
            sourceCode,
            tokenStore
          )
          if (
            kSlotGroupsOfSameSlot.length >= 2 &&
            !kSlotGroupsOfSameSlot[0].includes(node)
          ) {
            // E.g., <template #one></template>
            //       <template #one></template>
            context.report({
              node,
              messageId: 'disallowDuplicateSlotsOnChildren'
            })
          }
          if (kFor && !kSlotKForVar) {
            // E.g., <template k-for="x of xs" #one></template>
            context.report({
              node,
              messageId: 'disallowDuplicateSlotsOnChildren'
            })
          }
        }

        // Verify argument.
        if (isUsingScopeVar(node)) {
          context.report({
            node,
            messageId: 'disallowArgumentUseSlotParams'
          })
        }

        // Verify modifiers.
        if (hasInvalidModifiers(node, allowModifiers)) {
          // E.g., <template k-slot.foo>
          context.report({
            node,
            loc: {
              start: node.key.modifiers[0].loc.start,
              end: node.key.modifiers[node.key.modifiers.length - 1].loc.end
            },
            messageId: 'disallowAnyModifier'
          })
        }

        // Verify value.
        if (
          ownerElement === element &&
          isDefaultSlot &&
          (!node.value ||
            utils.isEmptyValueDirective(node, context) ||
            utils.isEmptyExpressionValueDirective(node, context))
        ) {
          context.report({
            node,
            messageId: 'requireAttributeValue'
          })
        }
      }
    })
  }
}
