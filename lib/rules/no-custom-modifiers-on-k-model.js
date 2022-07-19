/**
 * @author NKDuy
 * @fileoverview This rule checks whether k-model used on the component do not have custom modifiers
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const VALID_MODIFIERS = new Set(['lazy', 'number', 'trim'])

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow custom modifiers on k-model used on the component',
      categories: ['essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-custom-modifiers-on-k-model.html'
    },
    fixable: null,
    schema: [],
    messages: {
      notSupportedModifier:
        "'k-model' directives don't support the modifier '{{name}}'."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name.name='model']"(node) {
        const element = node.parent.parent

        if (utils.isCustomComponent(element)) {
          for (const modifier of node.key.modifiers) {
            if (!VALID_MODIFIERS.has(modifier.name)) {
              context.report({
                node,
                loc: node.loc,
                messageId: 'notSupportedModifier',
                data: { name: modifier.name }
              })
            }
          }
        }
      }
    })
  }
}
