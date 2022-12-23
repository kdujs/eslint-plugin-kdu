/**
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow using arrow functions to define watcher',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-arrow-functions-in-watch.html'
    },
    fixable: null,
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.executeOnKdu(context, (obj) => {
      const watchNode = utils.findProperty(obj, 'watch')
      if (watchNode == null) {
        return
      }
      const watchValue = watchNode.value
      if (watchValue.type !== 'ObjectExpression') {
        return
      }
      for (const property of watchValue.properties) {
        if (property.type !== 'Property') {
          continue
        }

        for (const handler of utils.iterateWatchHandlerValues(property)) {
          if (handler.type === 'ArrowFunctionExpression') {
            context.report({
              node: handler,
              message:
                'You should not use an arrow function to define a watcher.'
            })
          }
        }
      }
    })
  }
}
