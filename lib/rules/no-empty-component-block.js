/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { isKElement } = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/**
 * check whether has attribute `src`
 * @param {KElement} componentBlock
 */
function hasAttributeSrc(componentBlock) {
  const hasAttribute = componentBlock.startTag.attributes.length > 0

  const hasSrc =
    componentBlock.startTag.attributes.filter(
      (attribute) =>
        !attribute.directive &&
        attribute.key.name === 'src' &&
        attribute.value &&
        attribute.value.value !== ''
    ).length > 0

  return hasAttribute && hasSrc
}

/**
 * check whether value under the component block is only whitespaces or break lines
 * @param {KElement} componentBlock
 */
function isValueOnlyWhiteSpacesOrLineBreaks(componentBlock) {
  return (
    componentBlock.children.length === 1 &&
    componentBlock.children[0].type === 'KText' &&
    !componentBlock.children[0].value.trim()
  )
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow the `<template>` `<script>` `<style>` block to be empty',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-empty-component-block.html'
    },
    fixable: null,
    schema: [],
    messages: {
      unexpected: '`<{{ blockName }}>` is empty. Empty block is not allowed.'
    }
  },

  /**
   * @param {RuleContext} context - The rule context.
   * @returns {RuleListener} AST event handlers.
   */
  create(context) {
    if (!context.parserServices.getDocumentFragment) {
      return {}
    }
    const documentFragment = context.parserServices.getDocumentFragment()
    if (!documentFragment) {
      return {}
    }

    const componentBlocks = documentFragment.children.filter(isKElement)

    return {
      Program() {
        for (const componentBlock of componentBlocks) {
          if (
            componentBlock.name !== 'template' &&
            componentBlock.name !== 'script' &&
            componentBlock.name !== 'style'
          )
            continue

          // https://kdujs-loader.web.app/spec.html#src-imports
          if (hasAttributeSrc(componentBlock)) continue

          if (
            isValueOnlyWhiteSpacesOrLineBreaks(componentBlock) ||
            componentBlock.children.length === 0
          ) {
            context.report({
              node: componentBlock,
              loc: componentBlock.loc,
              messageId: 'unexpected',
              data: {
                blockName: componentBlock.name
              }
            })
          }
        }
      }
    }
  }
}
