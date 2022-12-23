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
      description:
        'disallow using deprecated the `is` attribute on HTML elements (in Kdu.js 3.0.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-html-element-is.html'
    },
    fixable: null,
    schema: [],
    messages: {
      unexpected: 'The `is` attribute on HTML element are deprecated.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @param {KElement} node */
    function isValidElement(node) {
      return (
        !utils.isHtmlWellKnownElementName(node.rawName) &&
        !utils.isSvgWellKnownElementName(node.rawName)
      )
    }
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='bind'][key.argument.name='is']"(
        node
      ) {
        if (isValidElement(node.parent.parent)) {
          return
        }
        context.report({
          node,
          loc: node.loc,
          messageId: 'unexpected'
        })
      },
      /** @param {KAttribute} node */
      "KAttribute[directive=false][key.name='is']"(node) {
        if (isValidElement(node.parent.parent)) {
          return
        }
        if (node.value && node.value.value.startsWith('kdu:')) {
          // Usage on native elements 3.1+
          return
        }
        context.report({
          node,
          loc: node.loc,
          messageId: 'unexpected'
        })
      }
    })
  }
}
