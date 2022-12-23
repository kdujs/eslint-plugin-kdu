/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const { getStyleVariablesContext } = require('../../utils/style-variables')

module.exports = {
  supported: '>=3.0.3',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createScriptVisitor(context) {
    const styleVars = getStyleVariablesContext(context)
    if (!styleVars) {
      return {}
    }
    return {
      Program() {
        for (const kBind of styleVars.kBinds) {
          context.report({
            node: kBind,
            messageId: 'forbiddenStyleCssVarsInjection'
          })
        }
      }
    }
  }
}
