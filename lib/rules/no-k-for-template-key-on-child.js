/**
 * @author NKDuy
 * This rule is based on X_K_FOR_TEMPLATE_KEY_PLACEMENT error of Kdu 3.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * Check whether the given attribute is using the variables which are defined by `k-for` directives.
 * @param {KDirective} kFor The attribute node of `k-for` to check.
 * @param {KDirective} kBindKey The attribute node of `k-bind:key` to check.
 * @returns {boolean} `true` if the node is using the variables which are defined by `k-for` directives.
 */
function isUsingIterationVar(kFor, kBindKey) {
  if (kBindKey.value == null) {
    return false
  }
  const references = kBindKey.value.references
  const variables = kFor.parent.parent.variables
  return references.some((reference) =>
    variables.some(
      (variable) =>
        variable.id.name === reference.id.name && variable.kind === 'k-for'
    )
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
        'disallow key of `<template k-for>` placed on child elements',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-k-for-template-key-on-child.html'
    },
    fixable: null,
    schema: [],
    messages: {
      kForTemplateKeyPlacement:
        '`<template k-for>` key should be placed on the `<template>` tag.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      /** @param {KDirective} node */
      "KElement[name='template'] > KStartTag > KAttribute[directive=true][key.name.name='for']"(
        node
      ) {
        const template = node.parent.parent
        const kBindKeyOnTemplate = utils.getDirective(template, 'bind', 'key')
        if (
          kBindKeyOnTemplate &&
          isUsingIterationVar(node, kBindKeyOnTemplate)
        ) {
          return
        }

        for (const child of template.children.filter(utils.isKElement)) {
          if (
            utils.hasDirective(child, 'if') ||
            utils.hasDirective(child, 'else-if') ||
            utils.hasDirective(child, 'else') ||
            utils.hasDirective(child, 'for')
          ) {
            continue
          }
          const kBindKeyOnChild = utils.getDirective(child, 'bind', 'key')
          if (kBindKeyOnChild && isUsingIterationVar(node, kBindKeyOnChild)) {
            context.report({
              node: kBindKeyOnChild,
              loc: kBindKeyOnChild.loc,
              messageId: 'kForTemplateKeyPlacement'
            })
          }
        }
      }
    })
  }
}
