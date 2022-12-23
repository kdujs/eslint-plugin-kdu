/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'
module.exports = {
  supported: '>=2.6.0',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createTemplateBodyVisitor(context) {
    const sourceCode = context.getSourceCode()

    /**
     * Checks whether the given node can convert to the `slot`.
     * @param {KDirective} kSlotAttr node of `k-slot`
     * @returns {boolean} `true` if the given node can convert to the `slot`
     */
    function canConvertToSlot(kSlotAttr) {
      if (kSlotAttr.parent.parent.name !== 'template') {
        return false
      }
      return true
    }
    /**
     * Convert to `slot` and `slot-scope`.
     * @param {RuleFixer} fixer fixer
     * @param {KDirective} kSlotAttr node of `k-slot`
     * @returns {null|Fix} fix data
     */
    function fixKSlotToSlot(fixer, kSlotAttr) {
      const key = kSlotAttr.key
      if (key.modifiers.length) {
        // unknown modifiers
        return null
      }

      const attrs = []
      const argument = key.argument
      if (argument) {
        if (argument.type === 'KIdentifier') {
          const name = argument.rawName
          attrs.push(`slot="${name}"`)
        } else if (
          argument.type === 'KExpressionContainer' &&
          argument.expression
        ) {
          const expression = sourceCode.getText(argument.expression)
          attrs.push(`:slot="${expression}"`)
        } else {
          // unknown or syntax error
          return null
        }
      }
      const scopedValueNode = kSlotAttr.value
      if (scopedValueNode) {
        attrs.push(`slot-scope=${sourceCode.getText(scopedValueNode)}`)
      }
      if (!attrs.length) {
        attrs.push('slot') // useless
      }
      return fixer.replaceText(kSlotAttr, attrs.join(' '))
    }
    /**
     * Reports `k-slot` node
     * @param {KDirective} kSlotAttr node of `k-slot`
     * @returns {void}
     */
    function reportKSlot(kSlotAttr) {
      context.report({
        node: kSlotAttr.key,
        messageId: 'forbiddenKSlot',
        // fix to use `slot` (downgrade)
        fix(fixer) {
          if (!canConvertToSlot(kSlotAttr)) {
            return null
          }
          return fixKSlotToSlot(fixer, kSlotAttr)
        }
      })
    }

    return {
      "KAttribute[directive=true][key.name.name='slot']": reportKSlot
    }
  }
}
