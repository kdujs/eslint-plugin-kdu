/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
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
      description: 'disallow k-text / k-html on component',
      // TODO We will change it in the next major version.
      // categories: ['essential', 'kdu3-essential'],
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-k-text-k-html-on-component.html'
    },
    fixable: null,
    schema: [],
    messages: {
      disallow:
        "Using {{directiveName}} on component may break component's content."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /**
     * Verify for k-text and k-html directive
     * @param {KDirective} node
     */
    function verify(node) {
      const element = node.parent.parent
      if (utils.isCustomComponent(element)) {
        context.report({
          node,
          loc: node.loc,
          messageId: 'disallow',
          data: {
            directiveName: `k-${node.key.name.name}`
          }
        })
      }
    }

    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name.name='text']": verify,
      "KAttribute[directive=true][key.name.name='html']": verify
    })
  }
}
