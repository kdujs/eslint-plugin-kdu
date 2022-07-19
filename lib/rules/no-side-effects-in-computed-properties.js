/**
 * @fileoverview Don't introduce side effects in computed properties
 * @author NKDuy
 */
'use strict'
const { ReferenceTracker, findVariable } = require('eslint-utils')
const utils = require('../utils')

/**
 * @typedef {import('../utils').KduObjectData} KduObjectData
 * @typedef {import('../utils').KduVisitor} KduVisitor
 * @typedef {import('../utils').ComponentComputedProperty} ComponentComputedProperty
 */

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow side effects in computed properties',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-side-effects-in-computed-properties.html'
    },
    fixable: null,
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @type {Map<ObjectExpression, ComponentComputedProperty[]>} */
    const computedPropertiesMap = new Map()
    /** @type {Array<FunctionExpression | ArrowFunctionExpression>} */
    const computedCallNodes = []
    /** @type {[number, number][]} */
    const setupRanges = []

    /**
     * @typedef {object} ScopeStack
     * @property {ScopeStack | null} upper
     * @property {BlockStatement | Expression | null} body
     */
    /**
     * @type {ScopeStack | null}
     */
    let scopeStack = null

    /** @param {FunctionExpression | ArrowFunctionExpression | FunctionDeclaration} node */
    function onFunctionEnter(node) {
      scopeStack = {
        upper: scopeStack,
        body: node.body
      }
    }

    function onFunctionExit() {
      scopeStack = scopeStack && scopeStack.upper
    }

    const nodeVisitor = {
      ':function': onFunctionEnter,
      ':function:exit': onFunctionExit,

      /**
       * @param {(Identifier | ThisExpression) & {parent: MemberExpression}} node
       * @param {KduObjectData|undefined} [info]
       */
      'MemberExpression > :matches(Identifier, ThisExpression)'(node, info) {
        if (!scopeStack) {
          return
        }
        const targetBody = scopeStack.body

        const computedProperty = (
          info ? computedPropertiesMap.get(info.node) || [] : []
        ).find((cp) => {
          return (
            cp.value &&
            cp.value.range[0] <= node.range[0] &&
            node.range[1] <= cp.value.range[1] &&
            targetBody === cp.value
          )
        })
        if (computedProperty) {
          const mem = node.parent
          if (mem.object !== node) {
            return
          }

          const isThis = utils.isThis(node, context)
          const isKdu = node.type === 'Identifier' && node.name === 'Kdu'

          const isKduSet =
            mem.parent.type === 'CallExpression' &&
            mem.property.type === 'Identifier' &&
            ((isThis && mem.property.name === '$set') ||
              (isKdu && mem.property.name === 'set'))

          const invalid = isKduSet
            ? { node: mem.property }
            : isThis && utils.findMutating(mem)

          if (invalid) {
            context.report({
              node: invalid.node,
              message: 'Unexpected side effect in "{{key}}" computed property.',
              data: { key: computedProperty.key || 'Unknown' }
            })
          }
          return
        }

        // ignore `this` for computed functions
        if (node.type === 'ThisExpression') {
          return
        }

        const computedFunction = computedCallNodes.find(
          (c) =>
            c.range[0] <= node.range[0] &&
            node.range[1] <= c.range[1] &&
            targetBody === c.body
        )
        if (!computedFunction) {
          return
        }

        const mem = node.parent
        if (mem.object !== node) {
          return
        }

        const variable = findVariable(context.getScope(), node)
        if (!variable || variable.defs.length !== 1) {
          return
        }

        const def = variable.defs[0]
        if (
          def.type === 'ImplicitGlobalVariable' ||
          def.type === 'TDZ' ||
          def.type === 'ImportBinding'
        ) {
          return
        }

        const isDeclaredInsideSetup = setupRanges.some(
          ([start, end]) =>
            start <= def.node.range[0] && def.node.range[1] <= end
        )
        if (!isDeclaredInsideSetup) {
          return
        }

        if (
          computedFunction.range[0] <= def.node.range[0] &&
          def.node.range[1] <= computedFunction.range[1]
        ) {
          // mutating local variables are accepted
          return
        }

        const invalid = utils.findMutating(node)
        if (invalid) {
          context.report({
            node: invalid.node,
            message: 'Unexpected side effect in computed function.'
          })
        }
      }
    }
    const scriptSetupNode = utils.getScriptSetupElement(context)
    if (scriptSetupNode) {
      setupRanges.push(scriptSetupNode.range)
    }
    return utils.compositingVisitors(
      {
        Program() {
          const tracker = new ReferenceTracker(context.getScope())
          const traceMap = utils.createCompositionApiTraceMap({
            [ReferenceTracker.ESM]: true,
            computed: {
              [ReferenceTracker.CALL]: true
            }
          })

          for (const { node } of tracker.iterateEsmReferences(traceMap)) {
            if (node.type !== 'CallExpression') {
              continue
            }

            const getterBody = utils.getGetterBodyFromComputedFunction(node)
            if (getterBody) {
              computedCallNodes.push(getterBody)
            }
          }
        }
      },
      scriptSetupNode
        ? utils.defineScriptSetupVisitor(context, nodeVisitor)
        : utils.defineKduVisitor(context, {
            onKduObjectEnter(node) {
              computedPropertiesMap.set(node, utils.getComputedProperties(node))
            },
            onSetupFunctionEnter(node) {
              setupRanges.push(node.body.range)
            },
            ...nodeVisitor
          })
    )
  }
}
