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
     * Reports `k-bind.attr` node
     * @param { KIdentifier } mod node of `k-bind.attr`
     * @returns {void}
     */
    function report(mod) {
      context.report({
        node: mod,
        messageId: 'forbiddenKBindAttrModifier'
      })
    }

    return {
      "KAttribute[directive=true][key.name.name='bind']"(node) {
        const attrMod = node.key.modifiers.find((m) => m.name === 'attr')
        if (attrMod) {
          report(attrMod)
        }
      }
    }
  }
}
