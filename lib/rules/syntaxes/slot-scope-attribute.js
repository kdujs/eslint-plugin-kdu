/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const canConvertToKSlotForElement = require('./utils/can-convert-to-k-slot')

module.exports = {
  deprecated: '2.6.0',
  supported: '>=2.5.0 <3.0.0',
  /**
   * @param {RuleContext} context
   * @param {object} option
   * @param {boolean} [option.fixToUpgrade]
   * @returns {TemplateListener}
   */
  createTemplateBodyVisitor(context, { fixToUpgrade } = {}) {
    const sourceCode = context.getSourceCode()
    const tokenStore =
      context.parserServices.getTemplateBodyTokenStore &&
      context.parserServices.getTemplateBodyTokenStore()

    /**
     * Checks whether the given node can convert to the `k-slot`.
     * @param {KStartTag} startTag node of `<element k-slot ... >`
     * @returns {boolean} `true` if the given node can convert to the `k-slot`
     */
    function canConvertToKSlot(startTag) {
      if (
        !canConvertToKSlotForElement(startTag.parent, sourceCode, tokenStore)
      ) {
        return false
      }

      const slotAttr = startTag.attributes.find(
        (attr) => attr.directive === false && attr.key.name === 'slot'
      )
      if (slotAttr) {
        // if the element have `slot` it can not be converted.
        // Conversion of `slot` is done with `kdu/no-deprecated-slot-attribute`.
        return false
      }

      const kBindSlotAttr = startTag.attributes.find(
        (attr) =>
          attr.directive === true &&
          attr.key.name.name === 'bind' &&
          attr.key.argument &&
          attr.key.argument.type === 'KIdentifier' &&
          attr.key.argument.name === 'slot'
      )
      if (kBindSlotAttr) {
        // if the element have `k-bind:slot` it can not be converted.
        // Conversion of `k-bind:slot` is done with `kdu/no-deprecated-slot-attribute`.
        return false
      }
      return true
    }

    /**
     * Convert to `k-slot`.
     * @param {RuleFixer} fixer fixer
     * @param {KDirective} scopeAttr node of `slot-scope`
     * @returns {Fix} fix data
     */
    function fixSlotScopeToKSlot(fixer, scopeAttr) {
      const scopeValue =
        scopeAttr && scopeAttr.value
          ? `=${sourceCode.getText(scopeAttr.value)}`
          : ''

      const replaceText = `k-slot${scopeValue}`
      return fixer.replaceText(scopeAttr, replaceText)
    }
    /**
     * Reports `slot-scope` node
     * @param {KDirective} scopeAttr node of `slot-scope`
     * @returns {void}
     */
    function reportSlotScope(scopeAttr) {
      context.report({
        node: scopeAttr.key,
        messageId: 'forbiddenSlotScopeAttribute',
        fix(fixer) {
          if (!fixToUpgrade) {
            return null
          }
          // fix to use `k-slot`
          const startTag = scopeAttr.parent
          if (!canConvertToKSlot(startTag)) {
            return null
          }
          return fixSlotScopeToKSlot(fixer, scopeAttr)
        }
      })
    }

    return {
      "KAttribute[directive=true][key.name.name='slot-scope']": reportSlotScope
    }
  }
}
