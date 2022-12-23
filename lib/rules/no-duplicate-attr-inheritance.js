/**
 * @fileoverview Disable inheritAttrs when using k-bind="$attrs"
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'enforce `inheritAttrs` to be set to `false` when using `k-bind="$attrs"`',
      categories: undefined,
      recommended: false,
      url: 'https://kdujs-eslint.web.app/rules/no-duplicate-attr-inheritance.html'
    },
    fixable: null,
    schema: [
      // fill in your schema
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @type {string | number | boolean | RegExp | BigInt | null} */
    let inheritsAttrs = true

    return Object.assign(
      utils.executeOnKdu(context, (node) => {
        const inheritAttrsProp = utils.findProperty(node, 'inheritAttrs')

        if (inheritAttrsProp && inheritAttrsProp.value.type === 'Literal') {
          inheritsAttrs = inheritAttrsProp.value.value
        }
      }),
      utils.defineTemplateBodyVisitor(context, {
        /** @param {KExpressionContainer} node */
        "KAttribute[directive=true][key.name.name='bind'][key.argument=null] > KExpressionContainer"(
          node
        ) {
          if (!inheritsAttrs) {
            return
          }
          const attrsRef = node.references.find((reference) => {
            if (reference.variable != null) {
              // Not vm reference
              return false
            }
            return reference.id.name === '$attrs'
          })

          if (attrsRef) {
            context.report({
              node: attrsRef.id,
              message: 'Set "inheritAttrs" to false.'
            })
          }
        }
      })
    )
  }
}
