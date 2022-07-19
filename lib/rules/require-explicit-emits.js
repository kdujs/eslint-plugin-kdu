/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

/**
 * @typedef {import('../utils').ComponentEmit} ComponentEmit
 * @typedef {import('../utils').ComponentProp} ComponentProp
 * @typedef {import('../utils').KduObjectData} KduObjectData
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const {
  findVariable,
  isOpeningBraceToken,
  isClosingBraceToken,
  isOpeningBracketToken
} = require('eslint-utils')
const utils = require('../utils')
const { capitalize } = require('../utils/casing')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const FIX_EMITS_AFTER_OPTIONS = [
  'setup',
  'data',
  'computed',
  'watch',
  'methods',
  'template',
  'render',
  'renderError',

  // lifecycle hooks
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'activated',
  'deactivated',
  'beforeUnmount',
  'unmounted',
  'beforeDestroy',
  'destroyed',
  'renderTracked',
  'renderTriggered',
  'errorCaptured'
]
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    hasSuggestions: true,
    type: 'suggestion',
    docs: {
      description: 'require `emits` option with name triggered by `$emit()`',
      categories: ['kdu3-strongly-recommended'],
      url: 'https://kdujs-eslint.web.app/rules/require-explicit-emits.html'
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowProps: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      missing:
        'The "{{name}}" event has been triggered but not declared on {{emitsKind}}.',
      addOneOption: 'Add the "{{name}}" to {{emitsKind}}.',
      addArrayEmitsOption:
        'Add the {{emitsKind}} with array syntax and define "{{name}}" event.',
      addObjectEmitsOption:
        'Add the {{emitsKind}} with object syntax and define "{{name}}" event.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const options = context.options[0] || {}
    const allowProps = !!options.allowProps
    /** @type {Map<ObjectExpression | Program, { contextReferenceIds: Set<Identifier>, emitReferenceIds: Set<Identifier> }>} */
    const setupContexts = new Map()
    /** @type {Map<ObjectExpression | Program, ComponentEmit[]>} */
    const kduEmitsDeclarations = new Map()
    /** @type {Map<ObjectExpression | Program, ComponentProp[]>} */
    const kduPropsDeclarations = new Map()

    /**
     * @typedef {object} KduTemplateDefineData
     * @property {'export' | 'mark' | 'definition' | 'setup'} type
     * @property {ObjectExpression | Program} define
     * @property {ComponentEmit[]} emits
     * @property {ComponentProp[]} props
     * @property {CallExpression} [defineEmits]
     */
    /** @type {KduTemplateDefineData | null} */
    let kduTemplateDefineData = null

    /**
     * @param {ComponentEmit[]} emits
     * @param {ComponentProp[]} props
     * @param {Literal} nameLiteralNode
     * @param {ObjectExpression | Program} kduDefineNode
     */
    function verifyEmit(emits, props, nameLiteralNode, kduDefineNode) {
      const name = `${nameLiteralNode.value}`
      if (emits.some((e) => e.emitName === name || e.emitName == null)) {
        return
      }
      if (allowProps) {
        const key = `on${capitalize(name)}`
        if (props.some((e) => e.propName === key || e.propName == null)) {
          return
        }
      }
      context.report({
        node: nameLiteralNode,
        messageId: 'missing',
        data: {
          name,
          emitsKind:
            kduDefineNode.type === 'ObjectExpression'
              ? '`emits` option'
              : '`defineEmits`'
        },
        suggest: buildSuggest(kduDefineNode, emits, nameLiteralNode, context)
      })
    }

    const programNode = context.getSourceCode().ast
    if (utils.isScriptSetup(context)) {
      // init
      kduTemplateDefineData = {
        type: 'setup',
        define: programNode,
        emits: [],
        props: []
      }
    }

    const callVisitor = {
      /**
       * @param {CallExpression & { arguments: [Literal, ...Expression] }} node
       * @param {KduObjectData} [info]
       */
      'CallExpression[arguments.0.type=Literal]'(node, info) {
        const callee = utils.skipChainExpression(node.callee)
        const nameLiteralNode = node.arguments[0]
        if (!nameLiteralNode || typeof nameLiteralNode.value !== 'string') {
          // cannot check
          return
        }
        const kduDefineNode = info ? info.node : programNode
        const emitsDeclarations = kduEmitsDeclarations.get(kduDefineNode)
        if (!emitsDeclarations) {
          return
        }

        let emit
        if (callee.type === 'MemberExpression') {
          const name = utils.getStaticPropertyName(callee)
          if (name === 'emit' || name === '$emit') {
            emit = { name, member: callee }
          }
        }

        // verify setup context
        const setupContext = setupContexts.get(kduDefineNode)
        if (setupContext) {
          const { contextReferenceIds, emitReferenceIds } = setupContext
          if (callee.type === 'Identifier' && emitReferenceIds.has(callee)) {
            // verify setup(props,{emit}) {emit()}
            verifyEmit(
              emitsDeclarations,
              kduPropsDeclarations.get(kduDefineNode) || [],
              nameLiteralNode,
              kduDefineNode
            )
          } else if (emit && emit.name === 'emit') {
            const memObject = utils.skipChainExpression(emit.member.object)
            if (
              memObject.type === 'Identifier' &&
              contextReferenceIds.has(memObject)
            ) {
              // verify setup(props,context) {context.emit()}
              verifyEmit(
                emitsDeclarations,
                kduPropsDeclarations.get(kduDefineNode) || [],
                nameLiteralNode,
                kduDefineNode
              )
            }
          }
        }

        // verify $emit
        if (emit && emit.name === '$emit') {
          const memObject = utils.skipChainExpression(emit.member.object)
          if (utils.isThis(memObject, context)) {
            // verify this.$emit()
            verifyEmit(
              emitsDeclarations,
              kduPropsDeclarations.get(kduDefineNode) || [],
              nameLiteralNode,
              kduDefineNode
            )
          }
        }
      }
    }

    return utils.defineTemplateBodyVisitor(
      context,
      {
        /** @param { CallExpression & { argument: [Literal, ...Expression] } } node */
        'CallExpression[arguments.0.type=Literal]'(node) {
          const callee = utils.skipChainExpression(node.callee)
          const nameLiteralNode = /** @type {Literal} */ (node.arguments[0])
          if (!nameLiteralNode || typeof nameLiteralNode.value !== 'string') {
            // cannot check
            return
          }
          if (!kduTemplateDefineData) {
            return
          }
          if (callee.type === 'Identifier' && callee.name === '$emit') {
            verifyEmit(
              kduTemplateDefineData.emits,
              kduTemplateDefineData.props,
              nameLiteralNode,
              kduTemplateDefineData.define
            )
          }
        }
      },
      utils.compositingVisitors(
        utils.defineScriptSetupVisitor(context, {
          onDefineEmitsEnter(node, emits) {
            kduEmitsDeclarations.set(programNode, emits)

            if (
              kduTemplateDefineData &&
              kduTemplateDefineData.type === 'setup'
            ) {
              kduTemplateDefineData.emits = emits
              kduTemplateDefineData.defineEmits = node
            }

            if (
              !node.parent ||
              node.parent.type !== 'VariableDeclarator' ||
              node.parent.init !== node
            ) {
              return
            }

            const emitParam = node.parent.id
            const variable =
              emitParam.type === 'Identifier'
                ? findVariable(context.getScope(), emitParam)
                : null
            if (!variable) {
              return
            }
            /** @type {Set<Identifier>} */
            const emitReferenceIds = new Set()
            for (const reference of variable.references) {
              if (!reference.isRead()) {
                continue
              }

              emitReferenceIds.add(reference.identifier)
            }
            setupContexts.set(programNode, {
              contextReferenceIds: new Set(),
              emitReferenceIds
            })
          },
          onDefinePropsEnter(_node, props) {
            if (allowProps) {
              kduPropsDeclarations.set(programNode, props)

              if (
                kduTemplateDefineData &&
                kduTemplateDefineData.type === 'setup'
              ) {
                kduTemplateDefineData.props = props
              }
            }
          },
          ...callVisitor
        }),
        utils.defineKduVisitor(context, {
          onKduObjectEnter(node) {
            kduEmitsDeclarations.set(
              node,
              utils.getComponentEmitsFromOptions(node)
            )
            if (allowProps) {
              kduPropsDeclarations.set(
                node,
                utils.getComponentPropsFromOptions(node)
              )
            }
          },
          onSetupFunctionEnter(node, { node: kduNode }) {
            const contextParam = node.params[1]
            if (!contextParam) {
              // no arguments
              return
            }
            if (contextParam.type === 'RestElement') {
              // cannot check
              return
            }
            if (contextParam.type === 'ArrayPattern') {
              // cannot check
              return
            }
            /** @type {Set<Identifier>} */
            const contextReferenceIds = new Set()
            /** @type {Set<Identifier>} */
            const emitReferenceIds = new Set()
            if (contextParam.type === 'ObjectPattern') {
              const emitProperty = utils.findAssignmentProperty(
                contextParam,
                'emit'
              )
              if (!emitProperty) {
                return
              }
              const emitParam = emitProperty.value
              // `setup(props, {emit})`
              const variable =
                emitParam.type === 'Identifier'
                  ? findVariable(context.getScope(), emitParam)
                  : null
              if (!variable) {
                return
              }
              for (const reference of variable.references) {
                if (!reference.isRead()) {
                  continue
                }

                emitReferenceIds.add(reference.identifier)
              }
            } else if (contextParam.type === 'Identifier') {
              // `setup(props, context)`
              const variable = findVariable(context.getScope(), contextParam)
              if (!variable) {
                return
              }
              for (const reference of variable.references) {
                if (!reference.isRead()) {
                  continue
                }

                contextReferenceIds.add(reference.identifier)
              }
            }
            setupContexts.set(kduNode, {
              contextReferenceIds,
              emitReferenceIds
            })
          },
          ...callVisitor,
          onKduObjectExit(node, { type }) {
            const emits = kduEmitsDeclarations.get(node)
            if (
              !kduTemplateDefineData ||
              (kduTemplateDefineData.type !== 'export' &&
                kduTemplateDefineData.type !== 'setup')
            ) {
              if (
                emits &&
                (type === 'mark' || type === 'export' || type === 'definition')
              ) {
                kduTemplateDefineData = {
                  type,
                  define: node,
                  emits,
                  props: kduPropsDeclarations.get(node) || []
                }
              }
            }
            setupContexts.delete(node)
            kduEmitsDeclarations.delete(node)
            kduPropsDeclarations.delete(node)
          }
        })
      )
    )
  }
}

/**
 * @param {ObjectExpression|Program} define
 * @param {ComponentEmit[]} emits
 * @param {Literal} nameNode
 * @param {RuleContext} context
 * @returns {Rule.SuggestionReportDescriptor[]}
 */
function buildSuggest(define, emits, nameNode, context) {
  const emitsKind =
    define.type === 'ObjectExpression' ? '`emits` option' : '`defineEmits`'
  const certainEmits = emits.filter((e) => e.key)
  if (certainEmits.length) {
    const last = certainEmits[certainEmits.length - 1]
    return [
      {
        messageId: 'addOneOption',
        data: {
          name: `${nameNode.value}`,
          emitsKind
        },
        fix(fixer) {
          if (last.type === 'array') {
            // Array
            return fixer.insertTextAfter(last.node, `, '${nameNode.value}'`)
          } else if (last.type === 'object') {
            // Object
            return fixer.insertTextAfter(
              last.node,
              `, '${nameNode.value}': null`
            )
          } else {
            // type
            // The argument is unknown and cannot be suggested.
            return null
          }
        }
      }
    ]
  }

  if (define.type !== 'ObjectExpression') {
    // We don't know where to put defineEmits.
    return []
  }

  const object = define

  const propertyNodes = object.properties.filter(utils.isProperty)

  const emitsOption = propertyNodes.find(
    (p) => utils.getStaticPropertyName(p) === 'emits'
  )
  if (emitsOption) {
    const sourceCode = context.getSourceCode()
    const emitsOptionValue = emitsOption.value
    if (emitsOptionValue.type === 'ArrayExpression') {
      const leftBracket = /** @type {Token} */ (
        sourceCode.getFirstToken(emitsOptionValue, isOpeningBracketToken)
      )
      return [
        {
          messageId: 'addOneOption',
          data: { name: `${nameNode.value}`, emitsKind },
          fix(fixer) {
            return fixer.insertTextAfter(
              leftBracket,
              `'${nameNode.value}'${
                emitsOptionValue.elements.length ? ',' : ''
              }`
            )
          }
        }
      ]
    } else if (emitsOptionValue.type === 'ObjectExpression') {
      const leftBrace = /** @type {Token} */ (
        sourceCode.getFirstToken(emitsOptionValue, isOpeningBraceToken)
      )
      return [
        {
          messageId: 'addOneOption',
          data: { name: `${nameNode.value}`, emitsKind },
          fix(fixer) {
            return fixer.insertTextAfter(
              leftBrace,
              `'${nameNode.value}': null${
                emitsOptionValue.properties.length ? ',' : ''
              }`
            )
          }
        }
      ]
    }
    return []
  }

  const sourceCode = context.getSourceCode()
  const afterOptionNode = propertyNodes.find((p) =>
    FIX_EMITS_AFTER_OPTIONS.includes(utils.getStaticPropertyName(p) || '')
  )
  return [
    {
      messageId: 'addArrayEmitsOption',
      data: { name: `${nameNode.value}`, emitsKind },
      fix(fixer) {
        if (afterOptionNode) {
          return fixer.insertTextAfter(
            sourceCode.getTokenBefore(afterOptionNode),
            `\nemits: ['${nameNode.value}'],`
          )
        } else if (object.properties.length) {
          const before =
            propertyNodes[propertyNodes.length - 1] ||
            object.properties[object.properties.length - 1]
          return fixer.insertTextAfter(
            before,
            `,\nemits: ['${nameNode.value}']`
          )
        } else {
          const objectLeftBrace = /** @type {Token} */ (
            sourceCode.getFirstToken(object, isOpeningBraceToken)
          )
          const objectRightBrace = /** @type {Token} */ (
            sourceCode.getLastToken(object, isClosingBraceToken)
          )
          return fixer.insertTextAfter(
            objectLeftBrace,
            `\nemits: ['${nameNode.value}']${
              objectLeftBrace.loc.end.line < objectRightBrace.loc.start.line
                ? ''
                : '\n'
            }`
          )
        }
      }
    },
    {
      messageId: 'addObjectEmitsOption',
      data: { name: `${nameNode.value}`, emitsKind },
      fix(fixer) {
        if (afterOptionNode) {
          return fixer.insertTextAfter(
            sourceCode.getTokenBefore(afterOptionNode),
            `\nemits: {'${nameNode.value}': null},`
          )
        } else if (object.properties.length) {
          const before =
            propertyNodes[propertyNodes.length - 1] ||
            object.properties[object.properties.length - 1]
          return fixer.insertTextAfter(
            before,
            `,\nemits: {'${nameNode.value}': null}`
          )
        } else {
          const objectLeftBrace = /** @type {Token} */ (
            sourceCode.getFirstToken(object, isOpeningBraceToken)
          )
          const objectRightBrace = /** @type {Token} */ (
            sourceCode.getLastToken(object, isClosingBraceToken)
          )
          return fixer.insertTextAfter(
            objectLeftBrace,
            `\nemits: {'${nameNode.value}': null}${
              objectLeftBrace.loc.end.line < objectRightBrace.loc.start.line
                ? ''
                : '\n'
            }`
          )
        }
      }
    }
  ]
}
