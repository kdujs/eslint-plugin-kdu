/**
 * @fileoverview require prop type to be a constructor
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')
const { isDef } = require('../utils')

/**
 * @typedef {import('../utils').ComponentArrayProp} ComponentArrayProp
 * @typedef {import('../utils').ComponentObjectProp} ComponentObjectProp
 * @typedef {import('../utils').ComponentTypeProp} ComponentTypeProp
 */

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const message = 'The "{{name}}" property should be a constructor.'

const forbiddenTypes = [
  'Literal',
  'TemplateLiteral',
  'BinaryExpression',
  'UpdateExpression'
]

/**
 * @param {ESNode} node
 */
function isForbiddenType(node) {
  return (
    forbiddenTypes.indexOf(node.type) > -1 &&
    !(node.type === 'Literal' && node.value == null && !node.bigint)
  )
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require prop type to be a constructor',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/require-prop-type-constructor.html'
    },
    fixable: 'code', // or "code" or "whitespace"
    schema: []
  },

  /** @param {RuleContext} context */
  create(context) {
    /**
     * @param {string} propName
     * @param {ESNode} node
     */
    function checkPropertyNode(propName, node) {
      /** @type {ESNode[]} */
      const nodes =
        node.type === 'ArrayExpression' ? node.elements.filter(isDef) : [node]

      nodes
        .filter((prop) => isForbiddenType(prop))
        .forEach((prop) =>
          context.report({
            node: prop,
            message,
            data: {
              name: propName
            },
            fix: (fixer) => {
              if (prop.type === 'Literal' || prop.type === 'TemplateLiteral') {
                const newText = utils.getStringLiteralValue(prop, true)

                if (newText) {
                  return fixer.replaceText(prop, newText)
                }
              }
              return null
            }
          })
        )
    }

    /** @param {(ComponentArrayProp | ComponentObjectProp | ComponentTypeProp)[]} props */
    function verifyProps(props) {
      for (const prop of props) {
        if (!prop.value || prop.propName == null) {
          continue
        }
        if (
          isForbiddenType(prop.value) ||
          prop.value.type === 'ArrayExpression'
        ) {
          checkPropertyNode(prop.propName, prop.value)
        } else if (prop.value.type === 'ObjectExpression') {
          const typeProperty = utils.findProperty(prop.value, 'type')

          if (!typeProperty) continue

          checkPropertyNode(prop.propName, typeProperty.value)
        }
      }
    }

    return utils.compositingVisitors(
      utils.defineScriptSetupVisitor(context, {
        onDefinePropsEnter(_node, props) {
          verifyProps(props)
        }
      }),
      utils.executeOnKduComponent(context, (obj) => {
        verifyProps(utils.getComponentProps(obj))
      })
    )
  }
}
