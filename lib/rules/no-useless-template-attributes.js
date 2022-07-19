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
// Helpers
// ------------------------------------------------------------------------------

const SPECIAL_TEMPLATE_DIRECTIVES = new Set([
  'if',
  'else',
  'else-if',
  'for',
  'slot'
])

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow useless attribute on `<template>`',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-useless-template-attributes.html'
    },
    fixable: null,
    schema: [],
    messages: {
      unexpectedAttr: 'Unexpected useless attribute on `<template>`.',
      unexpectedDir: 'Unexpected useless directive on `<template>`.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /**
     * @param {KAttribute | KDirective} attr
     */
    function getKeyName(attr) {
      if (attr.directive) {
        if (attr.key.name.name !== 'bind') {
          // no k-bind
          return null
        }
        if (
          !attr.key.argument ||
          attr.key.argument.type === 'KExpressionContainer'
        ) {
          // unknown
          return null
        }
        return attr.key.argument.name
      }
      return attr.key.name
    }

    /**
     * @param {KAttribute | KDirective} attr
     */
    function isFragmentTemplateAttribute(attr) {
      if (attr.directive) {
        const directiveName = attr.key.name.name
        if (SPECIAL_TEMPLATE_DIRECTIVES.has(directiveName)) {
          return true
        }
        if (directiveName === 'slot-scope') {
          // `slot-scope` is deprecated in Kdu.js 2.6
          return true
        }
        if (directiveName === 'scope') {
          // `scope` is deprecated in Kdu.js 2.5
          return true
        }
      }

      const keyName = getKeyName(attr)
      if (keyName === 'slot') {
        // `slot` is deprecated in Kdu.js 2.6
        return true
      }

      return false
    }

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KStartTag} node */
      "KElement[name='template'][parent.type='KElement'] > KStartTag"(node) {
        if (!node.attributes.some(isFragmentTemplateAttribute)) {
          return
        }

        for (const attr of node.attributes) {
          if (isFragmentTemplateAttribute(attr)) {
            continue
          }
          const keyName = getKeyName(attr)
          if (keyName === 'key') {
            continue
          }
          context.report({
            node: attr,
            messageId: attr.directive ? 'unexpectedDir' : 'unexpectedAttr'
          })
        }
      }
    })
  }
}
