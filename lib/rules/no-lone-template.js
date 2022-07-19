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
      description: 'disallow unnecessary `<template>`',
      categories: ['kdu3-recommended', 'recommended'],
      url: 'https://kdujs-eslint.web.app/rules/no-lone-template.html'
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          ignoreAccessible: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      requireDirective: '`<template>` require directive.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const options = context.options[0] || {}
    const ignoreAccessible = options.ignoreAccessible === true

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

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KStartTag} node */
      "KElement[name='template'][parent.type='KElement'] > KStartTag"(node) {
        if (
          node.attributes.some((attr) => {
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
          })
        ) {
          return
        }

        if (
          ignoreAccessible &&
          node.attributes.some((attr) => {
            const keyName = getKeyName(attr)
            return keyName === 'id' || keyName === 'ref'
          })
        ) {
          return
        }

        context.report({
          node,
          messageId: 'requireDirective'
        })
      }
    })
  }
}
