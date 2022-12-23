/**
 * @fileoverview disallow mutation component props
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')
const { findVariable } = require('eslint-utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow mutation of component props',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-mutating-props.html'
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      // fill in your schema
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @type {Map<ObjectExpression|CallExpression, Set<string>>} */
    const propsMap = new Map()
    /** @type { { type: 'export' | 'mark' | 'definition', object: ObjectExpression } | { type: 'setup', object: CallExpression } | null } */
    let kduObjectData = null

    /**
     * @param {ASTNode} node
     * @param {string} name
     */
    function report(node, name) {
      context.report({
        node,
        message: 'Unexpected mutation of "{{key}}" prop.',
        data: {
          key: name
        }
      })
    }

    /**
     * @param {ASTNode} node
     * @returns {KExpressionContainer}
     */
    function getKExpressionContainer(node) {
      let n = node
      while (n.type !== 'KExpressionContainer') {
        n = /** @type {ASTNode} */ (n.parent)
      }
      return n
    }
    /**
     * @param {MemberExpression|AssignmentProperty} node
     * @returns {string}
     */
    function getPropertyNameText(node) {
      const name = utils.getStaticPropertyName(node)
      if (name) {
        return name
      }
      if (node.computed) {
        const expr = node.type === 'Property' ? node.key : node.property
        const str = context.getSourceCode().getText(expr)
        return `[${str}]`
      }
      return '?unknown?'
    }
    /**
     * @param {ASTNode} node
     * @returns {node is Identifier}
     */
    function isVmReference(node) {
      if (node.type !== 'Identifier') {
        return false
      }
      const parent = node.parent
      if (parent.type === 'MemberExpression') {
        if (parent.property === node) {
          // foo.id
          return false
        }
      } else if (parent.type === 'Property') {
        // {id: foo}
        if (parent.key === node && !parent.computed) {
          return false
        }
      }

      const exprContainer = getKExpressionContainer(node)

      for (const reference of exprContainer.references) {
        if (reference.variable != null) {
          // Not vm reference
          continue
        }
        if (reference.id === node) {
          return true
        }
      }
      return false
    }

    /**
     * @param {MemberExpression|Identifier} props
     * @param {string} name
     */
    function verifyMutating(props, name) {
      const invalid = utils.findMutating(props)
      if (invalid) {
        report(invalid.node, name)
      }
    }

    /**
     * @param {Pattern} param
     * @param {string[]} path
     * @returns {Generator<{ node: Identifier, path: string[] }>}
     */
    function* iteratePatternProperties(param, path) {
      if (!param) {
        return
      }
      if (param.type === 'Identifier') {
        yield {
          node: param,
          path
        }
      } else if (param.type === 'RestElement') {
        yield* iteratePatternProperties(param.argument, path)
      } else if (param.type === 'AssignmentPattern') {
        yield* iteratePatternProperties(param.left, path)
      } else if (param.type === 'ObjectPattern') {
        for (const prop of param.properties) {
          if (prop.type === 'Property') {
            const name = getPropertyNameText(prop)
            yield* iteratePatternProperties(prop.value, [...path, name])
          } else if (prop.type === 'RestElement') {
            yield* iteratePatternProperties(prop.argument, path)
          }
        }
      } else if (param.type === 'ArrayPattern') {
        for (let index = 0; index < param.elements.length; index++) {
          const element = param.elements[index]
          yield* iteratePatternProperties(element, [...path, `${index}`])
        }
      }
    }

    /**
     * @param {Identifier} prop
     * @param {string[]} path
     */
    function verifyPropVariable(prop, path) {
      const variable = findVariable(context.getScope(), prop)
      if (!variable) {
        return
      }

      for (const reference of variable.references) {
        if (!reference.isRead()) {
          continue
        }
        const id = reference.identifier

        const invalid = utils.findMutating(id)
        if (!invalid) {
          continue
        }
        let name
        if (path.length === 0) {
          if (invalid.pathNodes.length === 0) {
            continue
          }
          const mem = invalid.pathNodes[0]
          name = getPropertyNameText(mem)
        } else {
          if (invalid.pathNodes.length === 0 && invalid.kind !== 'call') {
            continue
          }
          name = path[0]
        }

        report(invalid.node, name)
      }
    }

    return utils.compositingVisitors(
      {},
      utils.defineScriptSetupVisitor(context, {
        onDefinePropsEnter(node, props) {
          const propsSet = new Set(
            props.map((p) => p.propName).filter(utils.isDef)
          )
          propsMap.set(node, propsSet)
          kduObjectData = {
            type: 'setup',
            object: node
          }

          let target = node
          if (
            target.parent &&
            target.parent.type === 'CallExpression' &&
            target.parent.arguments[0] === target &&
            target.parent.callee.type === 'Identifier' &&
            target.parent.callee.name === 'withDefaults'
          ) {
            target = target.parent
          }

          if (
            !target.parent ||
            target.parent.type !== 'VariableDeclarator' ||
            target.parent.init !== target
          ) {
            return
          }

          for (const { node: prop, path } of iteratePatternProperties(
            target.parent.id,
            []
          )) {
            verifyPropVariable(prop, path)
            propsSet.add(prop.name)
          }
        }
      }),
      utils.defineKduVisitor(context, {
        onKduObjectEnter(node) {
          propsMap.set(
            node,
            new Set(
              utils
                .getComponentProps(node)
                .map((p) => p.propName)
                .filter(utils.isDef)
            )
          )
        },
        onKduObjectExit(node, { type }) {
          if (
            (!kduObjectData ||
              (kduObjectData.type !== 'export' &&
                kduObjectData.type !== 'setup')) &&
            type !== 'instance'
          ) {
            kduObjectData = {
              type,
              object: node
            }
          }
        },
        onSetupFunctionEnter(node) {
          const propsParam = node.params[0]
          if (!propsParam) {
            // no arguments
            return
          }
          if (
            propsParam.type === 'RestElement' ||
            propsParam.type === 'ArrayPattern'
          ) {
            // cannot check
            return
          }
          for (const { node: prop, path } of iteratePatternProperties(
            propsParam,
            []
          )) {
            verifyPropVariable(prop, path)
          }
        },
        /** @param {(Identifier | ThisExpression) & { parent: MemberExpression } } node */
        'MemberExpression > :matches(Identifier, ThisExpression)'(
          node,
          { node: kduNode }
        ) {
          if (!utils.isThis(node, context)) {
            return
          }
          const mem = node.parent
          if (mem.object !== node) {
            return
          }
          const name = utils.getStaticPropertyName(mem)
          if (
            name &&
            /** @type {Set<string>} */ (propsMap.get(kduNode)).has(name)
          ) {
            verifyMutating(mem, name)
          }
        }
      }),
      utils.defineTemplateBodyVisitor(context, {
        /** @param {ThisExpression & { parent: MemberExpression } } node */
        'KExpressionContainer MemberExpression > ThisExpression'(node) {
          if (!kduObjectData) {
            return
          }
          const mem = node.parent
          if (mem.object !== node) {
            return
          }
          const name = utils.getStaticPropertyName(mem)
          if (
            name &&
            /** @type {Set<string>} */ (propsMap.get(kduObjectData.object)).has(
              name
            )
          ) {
            verifyMutating(mem, name)
          }
        },
        /** @param {Identifier } node */
        'KExpressionContainer Identifier'(node) {
          if (!kduObjectData) {
            return
          }
          if (!isVmReference(node)) {
            return
          }
          const name = node.name
          if (
            name &&
            /** @type {Set<string>} */ (propsMap.get(kduObjectData.object)).has(
              name
            )
          ) {
            verifyMutating(node, name)
          }
        },
        /** @param {ESNode} node */
        "KAttribute[directive=true][key.name.name='model'] KExpressionContainer > *"(
          node
        ) {
          if (!kduObjectData) {
            return
          }
          const nodes = utils.getMemberChaining(node)
          const first = nodes[0]
          let name
          if (isVmReference(first)) {
            name = first.name
          } else if (first.type === 'ThisExpression') {
            const mem = nodes[1]
            if (!mem) {
              return
            }
            name = utils.getStaticPropertyName(mem)
          } else {
            return
          }
          if (
            name &&
            /** @type {Set<string>} */ (propsMap.get(kduObjectData.object)).has(
              name
            )
          ) {
            report(node, name)
          }
        }
      })
    )
  }
}
