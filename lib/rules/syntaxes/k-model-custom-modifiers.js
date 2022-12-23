/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const BUILTIN_MODIFIERS = new Set(['lazy', 'number', 'trim'])

module.exports = {
  supported: '>=3.0.0',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createTemplateBodyVisitor(context) {
    return {
      /** @param {KDirectiveKey} node */
      "KAttribute[directive=true] > KDirectiveKey[name.name='model'][modifiers.length>0]"(
        node
      ) {
        for (const modifier of node.modifiers) {
          if (!BUILTIN_MODIFIERS.has(modifier.name)) {
            context.report({
              node: modifier,
              messageId: 'forbiddenKModelCustomModifiers'
            })
          }
        }
      }
    }
  }
}
