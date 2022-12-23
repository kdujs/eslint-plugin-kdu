/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow `key` attribute on `<template>`',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-template-key.html'
    },
    fixable: null,
    schema: [],
    messages: {
      disallow:
        "'<template>' cannot be keyed. Place the key on real elements instead."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KElement} node */
      "KElement[name='template']"(node) {
        const keyNode =
          utils.getAttribute(node, 'key') ||
          utils.getDirective(node, 'bind', 'key')
        if (keyNode) {
          if (utils.hasDirective(node, 'for')) {
            // It's valid for Kdu.js 3.x.
            // <template k-for="item in list" :key="item.id"> ... </template>
            return
          }
          context.report({
            node: keyNode,
            loc: keyNode.loc,
            messageId: 'disallow'
          })
        }
      }
    })
  }
}
