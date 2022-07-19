/**
 * @fileoverview Prevent variables used in JSX to be marked as unused
 * @author NKDuy
 */
'use strict'

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'prevent variables used in JSX to be marked as unused', // eslint-disable-line eslint-plugin/require-meta-docs-description
      categories: ['base'],
      url: 'https://kdujs-eslint.web.app/rules/jsx-uses-vars.html'
    },
    schema: []
  },
  /**
   * @param {RuleContext} context - The rule context.
   * @returns {RuleListener} AST event handlers.
   */
  create(context) {
    return {
      JSXOpeningElement(node) {
        let name
        if (node.name.type === 'JSXIdentifier') {
          // <Foo>
          name = node.name.name
        } else if (node.name.type === 'JSXMemberExpression') {
          // <Foo...Bar>
          let parent = node.name.object
          while (parent.type === 'JSXMemberExpression') {
            parent = parent.object
          }
          name = parent.name
        } else {
          return
        }

        context.markVariableAsUsed(name)
      }
    }
  }
}
