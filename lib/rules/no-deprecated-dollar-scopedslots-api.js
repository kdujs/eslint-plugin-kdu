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
        'disallow using deprecated `$scopedSlots` (in Kdu.js 3.0.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-dollar-scopedslots-api.html'
    },
    fixable: 'code',
    schema: [],
    messages: {
      deprecated: 'The `$scopedSlots` is deprecated.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(
      context,
      {
        KExpressionContainer(node) {
          for (const reference of node.references) {
            if (reference.variable != null) {
              // Not vm reference
              continue
            }
            if (reference.id.name === '$scopedSlots') {
              context.report({
                node: reference.id,
                messageId: 'deprecated',
                fix(fixer) {
                  return fixer.replaceText(reference.id, '$slots')
                }
              })
            }
          }
        }
      },
      utils.defineKduVisitor(context, {
        MemberExpression(node) {
          if (
            node.property.type !== 'Identifier' ||
            node.property.name !== '$scopedSlots'
          ) {
            return
          }
          if (!utils.isThis(node.object, context)) {
            return
          }

          context.report({
            node: node.property,
            messageId: 'deprecated',
            fix(fixer) {
              return fixer.replaceText(node.property, '$slots')
            }
          })
        }
      })
    )
  }
}
