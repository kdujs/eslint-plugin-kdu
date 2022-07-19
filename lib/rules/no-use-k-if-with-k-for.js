/**
 * @author NKDuy
 *
 * Style guide: https://kdu-js.web.app/style-guide/rules-essential.html#avoid-k-if-with-k-for
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
  return !!getKForUsingIterationVar(kIf)
}

/** @param {KDirective} kIf */
function getKForUsingIterationVar(kIf) {
  if (!kIf.value) {
    return null
  }
  const element = kIf.parent.parent
  for (const reference of kIf.value.references) {
    const targetKFor = element.variables.find(
      (variable) =>
        variable.id.name === reference.id.name && variable.kind === 'k-for'
    )
    if (targetKFor) {
      return targetKFor
    }
  }
  return null
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow use k-if on the same element as k-for',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-use-k-if-with-k-for.html'
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowUsingIterationVar: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    const options = context.options[0] || {}
    const allowUsingIterationVar = options.allowUsingIterationVar === true // default false
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KAttribute[directive=true][key.name.name='if']"(node) {
        const element = node.parent.parent

        if (utils.hasDirective(element, 'for')) {
          if (isUsingIterationVar(node)) {
            if (!allowUsingIterationVar) {
              const kForVar = getKForUsingIterationVar(node)
              if (!kForVar) {
                return
              }

              let targetKForExpr = kForVar.id.parent
              while (targetKForExpr.type !== 'KForExpression') {
                targetKForExpr = /** @type {ASTNode} */ (targetKForExpr.parent)
              }
              const iteratorNode = targetKForExpr.right
              context.report({
                node,
                loc: node.loc,
                message:
                  "The '{{iteratorName}}' {{kind}} inside 'k-for' directive should be replaced with a computed property that returns filtered array instead. You should not mix 'k-for' with 'k-if'.",
                data: {
                  iteratorName:
                    iteratorNode.type === 'Identifier'
                      ? iteratorNode.name
                      : context.getSourceCode().getText(iteratorNode),
                  kind:
                    iteratorNode.type === 'Identifier'
                      ? 'variable'
                      : 'expression'
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
