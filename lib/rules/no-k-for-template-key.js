/**
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow `key` attribute on `<template k-for>`',
      categories: ['essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-k-for-template-key.html'
    },
    fixable: null,
    schema: [],
    messages: {
      disallow:
        "'<template k-for>' cannot be keyed. Place the key on real elements instead."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KElement[name='template'] > KStartTag > KAttribute[directive=true][key.name.name='for']"(
        node
      ) {
        const element = node.parent.parent
        const keyNode =
          utils.getAttribute(element, 'key') ||
          utils.getDirective(element, 'bind', 'key')
        if (keyNode) {
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
