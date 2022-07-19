/**
 * @fileoverview disallow target="_blank" attribute without rel="noopener noreferrer"
 * @author NKDuy
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------
/** @param {KAttribute} node */
function isTargetBlank(node) {
  return (
    node.key &&
    node.key.name === 'target' &&
    node.value &&
    node.value.value === '_blank'
  )
}
/**
 * @param {KStartTag} node
 * @param {boolean} allowReferrer
 */
function hasSecureRel(node, allowReferrer) {
  return node.attributes.some((attr) => {
    if (attr.key && attr.key.name === 'rel') {
      const tags =
        attr.value &&
        attr.value.type === 'KLiteral' &&
        attr.value.value.toLowerCase().split(' ')
      return (
        tags &&
        tags.includes('noopener') &&
        (allowReferrer || tags.includes('noreferrer'))
      )
    } else {
      return false
    }
  })
}

/**
 * @param {KStartTag} node
 */
function hasExternalLink(node) {
  return node.attributes.some(
    (attr) =>
      attr.key &&
      attr.key.name === 'href' &&
      attr.value &&
      attr.value.type === 'KLiteral' &&
      /^(?:\w+:|\/\/)/.test(attr.value.value)
  )
}

/**
 * @param {KStartTag} node
 */
function hasDynamicLink(node) {
  return node.attributes.some(
    (attr) =>
      attr.key &&
      attr.key.type === 'KDirectiveKey' &&
      attr.key.name &&
      attr.key.name.name === 'bind' &&
      attr.key.argument &&
      attr.key.argument.type === 'KIdentifier' &&
      attr.key.argument.name === 'href'
  )
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'disallow target="_blank" attribute without rel="noopener noreferrer"',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-template-target-blank.html'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowReferrer: {
            type: 'boolean'
          },
          enforceDynamicLinks: {
            enum: ['always', 'never']
          }
        },
        additionalProperties: false
      }
    ]
  },

  /**
   * Creates AST event handlers for no-template-target-blank
   *
   * @param {RuleContext} context - The rule context.
   * @returns {Object} AST event handlers.
   */
  create(context) {
    const configuration = context.options[0] || {}
    const allowReferrer = configuration.allowReferrer || false
    const enforceDynamicLinks = configuration.enforceDynamicLinks || 'always'

    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KAttribute} node */
      'KAttribute[directive=false]'(node) {
        if (!isTargetBlank(node) || hasSecureRel(node.parent, allowReferrer)) {
          return
        }

        const hasDangerHref =
          hasExternalLink(node.parent) ||
          (enforceDynamicLinks === 'always' && hasDynamicLink(node.parent))

        if (hasDangerHref) {
          context.report({
            node,
            message:
              'Using target="_blank" without rel="noopener noreferrer" is a security risk.'
          })
        }
      }
    })
  }
}
