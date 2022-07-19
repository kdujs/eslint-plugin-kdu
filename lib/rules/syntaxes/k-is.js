/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'
module.exports = {
  deprecated: '3.1.0',
  supported: '>=3.0.0',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createTemplateBodyVisitor(context) {
    /**
     * Reports `k-is` node
     * @param {KDirective} kIsAttr node of `k-is`
     * @returns {void}
     */
    function reportKIs(kIsAttr) {
      context.report({
        node: kIsAttr.key,
        messageId: 'forbiddenKIs'
      })
    }

    return {
      "KAttribute[directive=true][key.name.name='is']": reportKIs
    }
  }
}
