/**
 * @fileoverview enforce that each component should be in its own file
 * @author NKDuy
 */
'use strict'
const utils = require('../utils')
const { getKduComponentDefinitionType } = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce that each component should be in its own file',
      categories: ['kdu3-strongly-recommended', 'strongly-recommended'],
      url: 'https://kdujs-eslint.web.app/rules/one-component-per-file.html'
    },
    fixable: null,
    schema: [],
    messages: {
      toManyComponents: 'There is more than one component in this file.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @type {ObjectExpression[]} */
    const components = []

    return Object.assign(
      {},
      utils.executeOnKduComponent(context, (node, type) => {
        if (type === 'definition') {
          const defType = getKduComponentDefinitionType(node)
          if (defType === 'mixin') {
            return
          }
        }
        components.push(node)
      }),
      {
        'Program:exit'() {
          if (components.length > 1) {
            for (const node of components) {
              context.report({
                node,
                messageId: 'toManyComponents'
              })
            }
          }
        }
      }
    )
  }
}
