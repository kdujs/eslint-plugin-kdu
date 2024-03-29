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
// Helpers
// ------------------------------------------------------------------------------

/**
 * Check whether the given `k-if` node is using the variable which is defined by the `k-for` directive.
 * @param {KDirective} kIf The `k-if` attribute node to check.
 * @returns {boolean} `true` if the `k-if` is using the variable which is defined by the `k-for` directive.
 */
function isUsingIterationVar(kIf) {
  const element = kIf.parent.parent
  return Boolean(
    kIf.value &&
      kIf.value.references.some((reference) =>
        element.variables.some(
          (variable) =>
            variable.id.name === reference.id.name && variable.kind === 'k-for'
        )
      )
  )
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow confusing `k-for` and `k-if` on the same element',
      categories: ['kdu3-recommended', 'recommended'],
      url: 'https://kdujs-eslint.web.app/rules/no-confusing-k-for-k-if.html',
      replacedBy: ['no-use-k-if-with-k-for']
    },
    deprecated: true,
    fixable: null,
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name.name='if']"(node) {
        const element = node.parent.parent

        if (utils.hasDirective(element, 'for') && !isUsingIterationVar(node)) {
          context.report({
            node,
            loc: node.loc,
            message: "This 'k-if' should be moved to the wrapper element."
          })
        }
      }
    })
  }
}
