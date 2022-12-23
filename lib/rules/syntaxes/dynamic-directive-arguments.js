/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'
module.exports = {
  supported: '>=2.6.0',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createTemplateBodyVisitor(context) {
    /**
     * Reports dynamic argument node
     * @param {KExpressionContainer} dynamicArgument node of dynamic argument
     * @returns {void}
     */
    function reportDynamicArgument(dynamicArgument) {
      context.report({
        node: dynamicArgument,
        messageId: 'forbiddenDynamicDirectiveArguments'
      })
    }

    return {
      'KAttribute[directive=true] > KDirectiveKey > KExpressionContainer':
        reportDynamicArgument
    }
  }
}
