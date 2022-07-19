/**
 * @fileoverview Require a name property in Kdu components
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')
const { getKduComponentDefinitionType } = require('../utils')

/**
 * @param {Property | SpreadElement} node
 * @returns {node is ObjectExpressionProperty}
 */
function isNameProperty(node) {
  return (
    node.type === 'Property' &&
    utils.getStaticPropertyName(node) === 'name' &&
    !node.computed
  )
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require a name property in Kdu components',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/require-name-property.html'
    },
    fixable: null,
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    if (utils.isScriptSetup(context)) {
      return {}
    }
    return utils.executeOnKdu(context, (component, type) => {
      if (type === 'definition') {
        const defType = getKduComponentDefinitionType(component)
        if (defType === 'mixin') {
          return
        }
      }

      if (component.properties.some(isNameProperty)) return

      context.report({
        node: component,
        message: 'Required name property is not set.'
      })
    })
  }
}
