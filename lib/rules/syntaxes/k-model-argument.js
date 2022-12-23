/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

module.exports = {
  supported: '>=3.0.0',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createTemplateBodyVisitor(context) {
    return {
      /** @param {KDirectiveKey & { argument: KExpressionContainer | KIdentifier }} node */
      "KAttribute[directive=true] > KDirectiveKey[name.name='model'][argument!=null]"(
        node
      ) {
        context.report({
          node: node.argument,
          messageId: 'forbiddenKModelArgument'
        })
      }
    }
  }
}
