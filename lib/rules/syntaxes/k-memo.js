/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'
module.exports = {
  supported: '>=3.2.0',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createTemplateBodyVisitor(context) {
    /**
     * Reports `k-is` node
     * @param {KDirective} kMemoAttr node of `k-is`
     * @returns {void}
     */
    function reportKMemo(kMemoAttr) {
      context.report({
        node: kMemoAttr.key,
        messageId: 'forbiddenKMemo'
      })
    }

    return {
      "KAttribute[directive=true][key.name.name='memo']": reportKMemo
    }
  }
}
