/**
 * @fileoverview Prevents boolean defaults from being set
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')

/**
 * @typedef {import('../utils').ComponentArrayProp} ComponentArrayProp
 * @typedef {import('../utils').ComponentObjectProp} ComponentObjectProp
 * @typedef {import('../utils').ComponentTypeProp} ComponentTypeProp
 */

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/**
 * @param {Property | SpreadElement} prop
 */
function isBooleanProp(prop) {
  return (
    prop.type === 'Property' &&
    prop.key.type === 'Identifier' &&
    prop.key.name === 'type' &&
    prop.value.type === 'Identifier' &&
    prop.value.name === 'Boolean'
  )
}

/**
 * @param {ObjectExpression} propDefValue
 */
function getDefaultNode(propDefValue) {
  return utils.findProperty(propDefValue, 'default')
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow boolean defaults',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-boolean-default.html'
    },
    fixable: 'code',
    schema: [
      {
        enum: ['default-false', 'no-default']
      }
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    const booleanType = context.options[0] || 'no-default'
    /**
     * @param {ComponentArrayProp | ComponentObjectProp | ComponentTypeProp} prop
     * @param { { [key: string]: Expression | undefined } } [withDefaultsExpressions]
     */
    function processProp(prop, withDefaultsExpressions) {
      if (prop.type === 'object') {
        if (prop.value.type !== 'ObjectExpression') {
          return
        }
        if (!prop.value.properties.some(isBooleanProp)) {
          return
        }
        const defaultNode = getDefaultNode(prop.value)
        if (!defaultNode) {
          return
        }
        verifyDefaultExpression(defaultNode.value)
      } else if (prop.type === 'type') {
        if (prop.types.length !== 1 || prop.types[0] !== 'Boolean') {
          return
        }
        const defaultNode =
          withDefaultsExpressions && withDefaultsExpressions[prop.propName]
        if (!defaultNode) {
          return
        }
        verifyDefaultExpression(defaultNode)
      }
    }
    /**
     * @param {(ComponentArrayProp | ComponentObjectProp | ComponentTypeProp)[]} props
     * @param { { [key: string]: Expression | undefined } } [withDefaultsExpressions]
     */
    function processProps(props, withDefaultsExpressions) {
      for (const prop of props) {
        processProp(prop, withDefaultsExpressions)
      }
    }

    /**
     * @param {Expression} defaultNode
     */
    function verifyDefaultExpression(defaultNode) {
      switch (booleanType) {
        case 'no-default':
          context.report({
            node: defaultNode,
            message:
              'Boolean prop should not set a default (Kdu defaults it to false).'
          })
          break

        case 'default-false':
          if (defaultNode.type !== 'Literal' || defaultNode.value !== false) {
            context.report({
              node: defaultNode,
              message: 'Boolean prop should only be defaulted to false.'
            })
          }
          break
      }
    }
    return utils.compositingVisitors(
      utils.executeOnKduComponent(context, (obj) => {
        processProps(utils.getComponentProps(obj))
      }),
      utils.defineScriptSetupVisitor(context, {
        onDefinePropsEnter(node, props) {
          processProps(props, utils.getWithDefaultsPropExpressions(node))
        }
      })
    )
  }
}
