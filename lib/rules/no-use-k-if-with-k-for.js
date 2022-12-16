/**
 * @author NKDuy
 * I implemented it with reference to `no-confusing-k-for-k-if`
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
 * @param {ASTNode} kIf The `k-if` attribute node to check.
 * @returns {boolean} `true` if the `k-if` is using the variable which is defined by the `k-for` directive.
 */
function isUsingIterationVar (kIf) {
  return !!getKForUsingIterationVar(kIf)
}

function getKForUsingIterationVar (kIf) {
  const element = kIf.parent.parent
  for (var i = 0; i < kIf.value.references.length; i++) {
    const reference = kIf.value.references[i]

    const targetKFor = element.variables.find(variable =>
      variable.id.name === reference.id.name &&
      variable.kind === 'k-for'
    )
    if (targetKFor) {
      return targetKFor.id.parent
    }
  }
  return undefined
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow use k-if on the same element as k-for',
      category: 'essential',
      url: 'https://github.com/kdujs/eslint-plugin-kdu/blob/v5.0.0/docs/rules/no-use-k-if-with-k-for.md'
    },
    fixable: null,
    schema: [{
      type: 'object',
      properties: {
        allowUsingIterationVar: {
          type: 'boolean'
        }
      }
    }]
  },

  create (context) {
    const options = context.options[0] || {}
    const allowUsingIterationVar = options.allowUsingIterationVar === true // default false
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name='if']" (node) {
        const element = node.parent.parent

        if (utils.hasDirective(element, 'for')) {
          if (isUsingIterationVar(node)) {
            if (!allowUsingIterationVar) {
              const kFor = getKForUsingIterationVar(node)
              context.report({
                node,
                loc: node.loc,
                message: "The '{{iteratorName}}' variable inside 'k-for' directive should be replaced with a computed property that returns filtered array instead. You should not mix 'k-for' with 'k-if'.",
                data: {
                  iteratorName: kFor.right.name
                }
              })
            }
          } else {
            context.report({
              node,
              loc: node.loc,
              message: "This 'k-if' should be moved to the wrapper element."
            })
          }
        }
      }
    })
  }
}
