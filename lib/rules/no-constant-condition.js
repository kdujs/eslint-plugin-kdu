/**
 * @author NKDuy
 */
'use strict'

const { wrapCoreRule } = require('../utils')

const conditionalDirectiveNames = new Set(['k-show', 'k-if', 'k-else-if'])

// eslint-disable-next-line no-invalid-meta, no-invalid-meta-docs-categories
module.exports = wrapCoreRule('no-constant-condition', {
  create(_context, { coreHandlers }) {
    return {
      KDirectiveKey(node) {
        if (
          conditionalDirectiveNames.has(`k-${node.name.name}`) &&
          node.parent.value &&
          node.parent.value.expression &&
          coreHandlers.IfStatement
        ) {
          coreHandlers.IfStatement({
            // @ts-expect-error -- Process expression of KExpressionContainer as IfStatement.
            test: node.parent.value.expression
          })
        }
      }
    }
  }
})
