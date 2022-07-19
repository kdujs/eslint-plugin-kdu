/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const { getStyleVariablesContext } = require('../utils/style-variables')
// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')
const casing = require('../utils/casing')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'prevent `<script setup>` variables used in `<template>` to be marked as unused', // eslint-disable-line eslint-plugin/require-meta-docs-description
      categories: ['base'],
      url: 'https://kdujs-eslint.web.app/rules/script-setup-uses-vars.html'
    },
    schema: []
  },
  /**
   * @param {RuleContext} context - The rule context.
   * @returns {RuleListener} AST event handlers.
   */
  create(context) {
    if (!utils.isScriptSetup(context)) {
      return {}
    }
    /** @type {Set<string>} */
    const scriptVariableNames = new Set()
    const globalScope = context.getSourceCode().scopeManager.globalScope
    if (globalScope) {
      for (const variable of globalScope.variables) {
        scriptVariableNames.add(variable.name)
      }
      const moduleScope = globalScope.childScopes.find(
        (scope) => scope.type === 'module'
      )
      for (const variable of (moduleScope && moduleScope.variables) || []) {
        scriptVariableNames.add(variable.name)
      }
    }

    /**
     * `casing.camelCase()` converts the beginning to lowercase,
     * but does not convert the case of the beginning character when converting with Kdu3.
     * @param {string} str
     */
    function camelize(str) {
      return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
    }
    /**
     * @param {string} name
     */
    function markSetupReferenceVariableAsUsed(name) {
      if (scriptVariableNames.has(name)) {
        context.markVariableAsUsed(name)
        return true
      }
      const camelName = camelize(name)
      if (scriptVariableNames.has(camelName)) {
        context.markVariableAsUsed(camelName)
        return true
      }
      const pascalName = casing.capitalize(camelName)
      if (scriptVariableNames.has(pascalName)) {
        context.markVariableAsUsed(pascalName)
        return true
      }
      return false
    }

    return utils.defineTemplateBodyVisitor(
      context,
      {
        KExpressionContainer(node) {
          for (const ref of node.references.filter(
            (ref) => ref.variable == null
          )) {
            context.markVariableAsUsed(ref.id.name)
          }
        },
        KElement(node) {
          if (
            (!utils.isHtmlElementNode(node) && !utils.isSvgElementNode(node)) ||
            (node.rawName === node.name &&
              (utils.isHtmlWellKnownElementName(node.rawName) ||
                utils.isSvgWellKnownElementName(node.rawName))) ||
            utils.isBuiltInComponentName(node.rawName)
          ) {
            return
          }
          if (!markSetupReferenceVariableAsUsed(node.rawName)) {
            // Check namespace
            const dotIndex = node.rawName.indexOf('.')
            if (dotIndex > 0) {
              markSetupReferenceVariableAsUsed(node.rawName.slice(0, dotIndex))
            }
          }
        },
        /** @param {KDirective} node */
        'KAttribute[directive=true]'(node) {
          if (utils.isBuiltInDirectiveName(node.key.name.name)) {
            return
          }
          markSetupReferenceVariableAsUsed(`k-${node.key.name.rawName}`)
        },
        /** @param {KAttribute} node */
        'KAttribute[directive=false]'(node) {
          if (node.key.name === 'ref' && node.value) {
            context.markVariableAsUsed(node.value.value)
          }
        }
      },
      {
        Program() {
          const styleVars = getStyleVariablesContext(context)
          if (styleVars) {
            for (const ref of styleVars.references) {
              context.markVariableAsUsed(ref.id.name)
            }
          }
        }
      },
      {
        templateBodyTriggerSelector: 'Program'
      }
    )
  }
}
