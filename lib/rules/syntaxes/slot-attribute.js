/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const canConvertToKSlot = require('./utils/can-convert-to-k-slot')

module.exports = {
  deprecated: '2.6.0',
  supported: '<3.0.0',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createTemplateBodyVisitor(context) {
    const sourceCode = context.getSourceCode()
    const tokenStore =
      context.parserServices.getTemplateBodyTokenStore &&
      context.parserServices.getTemplateBodyTokenStore()

    /**
     * Checks whether the given node can convert to the `k-slot`.
     * @param {KAttribute} slotAttr node of `slot`
     * @returns {boolean} `true` if the given node can convert to the `k-slot`
     */
    function canConvertFromSlotToKSlot(slotAttr) {
      if (!canConvertToKSlot(slotAttr.parent.parent, sourceCode, tokenStore)) {
        return false
      }
      if (!slotAttr.value) {
        return true
      }
      const slotName = slotAttr.value.value
      // If other than alphanumeric, underscore and hyphen characters are included it can not be converted.
      return !/[^\w\-]/u.test(slotName)
    }

    /**
     * Checks whether the given node can convert to the `k-slot`.
     * @param {KDirective} slotAttr node of `k-bind:slot`
     * @returns {boolean} `true` if the given node can convert to the `k-slot`
     */
    function canConvertFromKBindSlotToKSlot(slotAttr) {
      if (!canConvertToKSlot(slotAttr.parent.parent, sourceCode, tokenStore)) {
        return false
      }

      if (!slotAttr.value) {
        return true
      }

      if (!slotAttr.value.expression) {
        // parse error or empty expression
        return false
      }
      const slotName = sourceCode.getText(slotAttr.value.expression).trim()
      // If non-Latin characters are included it can not be converted.
      // It does not check the space only because `a>b?c:d` should be rejected.
      return !/[^a-z]/i.test(slotName)
    }

    /**
     * Convert to `k-slot`.
     * @param {RuleFixer} fixer fixer
     * @param {KAttribute|KDirective} slotAttr node of `slot`
     * @param {string | null} slotName name of `slot`
     * @param {boolean} kBind `true` if `slotAttr` is `k-bind:slot`
     * @returns {IterableIterator<Fix>} fix data
     */
    function* fixSlotToKSlot(fixer, slotAttr, slotName, kBind) {
      const element = slotAttr.parent
      const scopeAttr = element.attributes.find(
        (attr) =>
          attr.directive === true &&
          attr.key.name &&
          (attr.key.name.name === 'slot-scope' ||
            attr.key.name.name === 'scope')
      )
      const nameArgument = slotName
        ? kBind
          ? `:[${slotName}]`
          : `:${slotName}`
        : ''
      const scopeValue =
        scopeAttr && scopeAttr.value
          ? `=${sourceCode.getText(scopeAttr.value)}`
          : ''

      const replaceText = `k-slot${nameArgument}${scopeValue}`
      yield fixer.replaceText(slotAttr || scopeAttr, replaceText)
      if (slotAttr && scopeAttr) {
        yield fixer.remove(scopeAttr)
      }
    }
    /**
     * Reports `slot` node
     * @param {KAttribute} slotAttr node of `slot`
     * @returns {void}
     */
    function reportSlot(slotAttr) {
      context.report({
        node: slotAttr.key,
        messageId: 'forbiddenSlotAttribute',
        // fix to use `k-slot`
        *fix(fixer) {
          if (!canConvertFromSlotToKSlot(slotAttr)) {
            return
          }
          const slotName = slotAttr.value && slotAttr.value.value
          yield* fixSlotToKSlot(fixer, slotAttr, slotName, false)
        }
      })
    }
    /**
     * Reports `k-bind:slot` node
     * @param {KDirective} slotAttr node of `k-bind:slot`
     * @returns {void}
     */
    function reportKBindSlot(slotAttr) {
      context.report({
        node: slotAttr.key,
        messageId: 'forbiddenSlotAttribute',
        // fix to use `k-slot`
        *fix(fixer) {
          if (!canConvertFromKBindSlotToKSlot(slotAttr)) {
            return
          }
          const slotName =
            slotAttr.value &&
            slotAttr.value.expression &&
            sourceCode.getText(slotAttr.value.expression).trim()
          yield* fixSlotToKSlot(fixer, slotAttr, slotName, true)
        }
      })
    }

    return {
      "KAttribute[directive=false][key.name='slot']": reportSlot,
      "KAttribute[directive=true][key.name.name='bind'][key.argument.name='slot']":
        reportKBindSlot
    }
  }
}
