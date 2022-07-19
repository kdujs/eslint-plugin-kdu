/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const utils = require('../utils')
const slotScopeAttribute = require('./syntaxes/slot-scope-attribute')

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow deprecated `slot-scope` attribute (in Kdu.js 2.6.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-slot-scope-attribute.html'
    },
    fixable: 'code',
    schema: [],
    messages: {
      forbiddenSlotScopeAttribute: '`slot-scope` are deprecated.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const templateBodyVisitor = slotScopeAttribute.createTemplateBodyVisitor(
      context,
      { fixToUpgrade: true }
    )
    return utils.defineTemplateBodyVisitor(context, templateBodyVisitor)
  }
}
