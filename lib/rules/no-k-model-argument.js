/**
 * @author NKDuy
 * @fileoverview This rule checks whether k-model used on custom component do not have an argument
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'disallow adding an argument to `k-model` used in custom component',
      categories: ['essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-k-model-argument.html'
    },
    fixable: null,
    schema: [],
    messages: {
      kModelRequireNoArgument: "'k-model' directives require no argument."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='model']"(node) {
        const element = node.parent.parent

        if (node.key.argument && utils.isCustomComponent(element)) {
          context.report({
            node,
            loc: node.loc,
            messageId: 'kModelRequireNoArgument'
          })
        }
      }
    })
  }
}
