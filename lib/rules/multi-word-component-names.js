/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const path = require('path')
const casing = require('../utils/casing')
const utils = require('../utils')

const RESERVED_NAMES_IN_KDU3 = new Set(
  require('../utils/kdu3-builtin-components')
)

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require component names to be always multi-word',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/multi-word-component-names.html'
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignores: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            additionalItems: false
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpected: 'Component name "{{value}}" should always be multi-word.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @type {Set<string>} */
    const ignores = new Set()
    ignores.add('App')
    ignores.add('app')
    for (const ignore of (context.options[0] && context.options[0].ignores) ||
      []) {
      ignores.add(ignore)
      if (casing.isPascalCase(ignore)) {
        // PascalCase
        ignores.add(casing.kebabCase(ignore))
      }
    }
    let hasKdu = false
    let hasName = false

    /**
     * Returns true if the given component name is valid, otherwise false.
     * @param {string} name
     * */
    function isValidComponentName(name) {
      if (ignores.has(name) || RESERVED_NAMES_IN_KDU3.has(name)) {
        return true
      }
      const elements = casing.kebabCase(name).split('-')
      return elements.length > 1
    }

    /**
     * @param {Expression | SpreadElement} nameNode
     */
    function validateName(nameNode) {
      if (nameNode.type !== 'Literal') return
      const componentName = `${nameNode.value}`
      if (!isValidComponentName(componentName)) {
        context.report({
          node: nameNode,
          messageId: 'unexpected',
          data: {
            value: componentName
          }
        })
      }
    }

    return utils.compositingVisitors(
      utils.executeOnCallKduComponent(context, (node) => {
        hasKdu = true
        if (node.arguments.length !== 2) return
        hasName = true
        validateName(node.arguments[0])
      }),
      utils.executeOnKdu(context, (obj) => {
        hasKdu = true
        const node = utils.findProperty(obj, 'name')
        if (!node) return
        hasName = true
        validateName(node.value)
      }),
      {
        /** @param {Program} node */
        'Program:exit'(node) {
          if (hasName) return
          if (!hasKdu && node.body.length > 0) return
          const fileName = context.getFilename()
          const componentName = path.basename(fileName, path.extname(fileName))
          if (
            utils.isKduFile(fileName) &&
            !isValidComponentName(componentName)
          ) {
            context.report({
              messageId: 'unexpected',
              data: {
                value: componentName
              },
              loc: { line: 1, column: 0 }
            })
          }
        }
      }
    )
  }
}
