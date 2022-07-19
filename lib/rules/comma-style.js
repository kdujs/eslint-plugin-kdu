/**
 * @author NKDuy
 */
'use strict'

const { wrapCoreRule } = require('../utils')

// eslint-disable-next-line no-invalid-meta, no-invalid-meta-docs-categories
module.exports = wrapCoreRule('comma-style', {
  create(_context, { coreHandlers }) {
    return {
      KSlotScopeExpression(node) {
        if (coreHandlers.FunctionExpression) {
          // @ts-expect-error -- Process params of KSlotScopeExpression as FunctionExpression.
          coreHandlers.FunctionExpression(node)
        }
      }
    }
  }
})
