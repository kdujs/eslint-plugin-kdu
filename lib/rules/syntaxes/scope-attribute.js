/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'
module.exports = {
  deprecated: '2.5.0',
  supported: '<3.0.0',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createTemplateBodyVisitor(context) {
    /**
     * Reports `scope` node
     * @param {KDirectiveKey} scopeKey node of `scope`
     * @returns {void}
     */
    function reportScope(scopeKey) {
      context.report({
        node: scopeKey,
        messageId: 'forbiddenScopeAttribute',
        // fix to use `slot-scope`
        fix: (fixer) => fixer.replaceText(scopeKey, 'slot-scope')
      })
    }

    return {
      "KAttribute[directive=true] > KDirectiveKey[name.name='scope']":
        reportScope
    }
  }
}
