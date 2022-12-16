/**
 * @fileoverview Disallow variable declarations from shadowing variables declared in the outer scope.
 * @author NKDuy
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const GROUP_NAMES = ['props', 'computed', 'data', 'methods']

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow variable declarations from shadowing variables declared in the outer scope',
      category: 'strongly-recommended',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/no-template-shadow.md'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    const jsVars = new Set()
    let scope = {
      parent: null,
      nodes: []
    }

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return utils.defineTemplateBodyVisitor(context, {
      KElement (node) {
        scope = {
          parent: scope,
          nodes: scope.nodes.slice() // make copy
        }
        if (node.variables) {
          for (const variable of node.variables) {
            const varNode = variable.id
            const name = varNode.name
            if (scope.nodes.some(node => node.name === name) || jsVars.has(name)) {
              context.report({
                node: varNode,
                loc: varNode.loc,
                message: "Variable '{{name}}' is already declared in the upper scope.",
                data: {
                  name
                }
              })
            } else {
              scope.nodes.push(varNode)
            }
          }
        }
      },
      'KElement:exit' (node) {
        scope = scope.parent
      }
    }, utils.executeOnKdu(context, (obj) => {
      const properties = Array.from(utils.iterateProperties(obj, new Set(GROUP_NAMES)))
      for (const node of properties) {
        jsVars.add(node.name)
      }
    }))
  }
}
