/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')
const casing = require('../utils/casing')

// ------------------------------------------------------------------------------
// Rule helpers
// ------------------------------------------------------------------------------

/**
 * `casing.camelCase()` converts the beginning to lowercase,
 * but does not convert the case of the beginning character when converting with Kdu3.
 * @param {string} str
 */
function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow use of undefined components in `<template>`',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-undef-components.html'
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          ignorePatterns: {
            type: 'array'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      undef: "The '<{{name}}>' component has been used, but not defined."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const options = context.options[0] || {}
    /** @type {string[]} */
    const ignorePatterns = options.ignorePatterns || []

    /**
     * Check whether the given element name is a verify target or not.
     *
     * @param {string} rawName The element name.
     * @returns {boolean}
     */
    function isVerifyTargetComponent(rawName) {
      const kebabCaseName = casing.kebabCase(rawName)

      if (
        utils.isHtmlWellKnownElementName(rawName) ||
        utils.isSvgWellKnownElementName(rawName) ||
        utils.isBuiltInComponentName(kebabCaseName)
      ) {
        return false
      }
      const pascalCaseName = casing.pascalCase(rawName)
      // Check ignored patterns
      if (
        ignorePatterns.some((pattern) => {
          const regExp = new RegExp(pattern)
          return (
            regExp.test(rawName) ||
            regExp.test(kebabCaseName) ||
            regExp.test(pascalCaseName)
          )
        })
      ) {
        return false
      }
      return true
    }

    /** @type { (rawName:string, reportNode: ASTNode) => void } */
    let verifyName
    /** @type {RuleListener} */
    let scriptVisitor = {}
    /** @type {TemplateListener} */
    const templateBodyVisitor = {
      KElement(node) {
        if (!utils.isHtmlElementNode(node) && !utils.isSvgElementNode(node)) {
          return
        }
        verifyName(node.rawName, node.startTag)
      },
      /** @param {KAttribute} node */
      "KAttribute[directive=false][key.name='is']"(node) {
        if (
          !node.value // `<component is />`
        )
          return
        const value = node.value.value.startsWith('kdu:') // Usage on native elements 3.1+
          ? node.value.value.slice(4)
          : node.value.value
        verifyName(value, node)
      }
    }

    if (utils.isScriptSetup(context)) {
      // For <script setup>
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
       * @param {string} name
       */
      const existsSetupReference = (name) => {
        if (scriptVariableNames.has(name)) {
          return true
        }
        const camelName = camelize(name)
        if (scriptVariableNames.has(camelName)) {
          return true
        }
        const pascalName = casing.capitalize(camelName)
        if (scriptVariableNames.has(pascalName)) {
          return true
        }
        return false
      }
      verifyName = (rawName, reportNode) => {
        if (!isVerifyTargetComponent(rawName)) {
          return
        }
        if (existsSetupReference(rawName)) {
          return
        }
        // Check namespace
        const dotIndex = rawName.indexOf('.')
        if (dotIndex > 0) {
          if (existsSetupReference(rawName.slice(0, dotIndex))) {
            return
          }
        }

        context.report({
          node: reportNode,
          messageId: 'undef',
          data: {
            name: rawName
          }
        })
      }
    } else {
      // For Options API

      /**
       * All registered components
       * @type {string[]}
       */
      const registeredComponentNames = []
      /**
       * All registered components, transformed to kebab-case
       * @type {string[]}
       */
      const registeredComponentKebabCaseNames = []

      /**
       * All registered components using kebab-case syntax
       * @type {string[]}
       */
      const componentsRegisteredAsKebabCase = []

      scriptVisitor = utils.executeOnKdu(context, (obj) => {
        registeredComponentNames.push(
          ...utils.getRegisteredComponents(obj).map(({ name }) => name)
        )

        const nameProperty = utils.findProperty(obj, 'name')

        if (nameProperty && utils.isStringLiteral(nameProperty.value)) {
          const name = utils.getStringLiteralValue(nameProperty.value)
          if (name) {
            registeredComponentNames.push(name)
          }
        }

        registeredComponentKebabCaseNames.push(
          ...registeredComponentNames.map((name) => casing.kebabCase(name))
        )
        componentsRegisteredAsKebabCase.push(
          ...registeredComponentNames.filter(
            (name) => name === casing.kebabCase(name)
          )
        )
      })

      verifyName = (rawName, reportNode) => {
        if (!isVerifyTargetComponent(rawName)) {
          return
        }
        if (registeredComponentNames.includes(rawName)) {
          return
        }
        const kebabCaseName = casing.kebabCase(rawName)
        if (registeredComponentKebabCaseNames.includes(kebabCaseName)) {
          if (
            // Component registered as `foo-bar` cannot be used as `FooBar`
            !casing.isPascalCase(rawName)
          ) {
            return
          }
        }

        context.report({
          node: reportNode,
          messageId: 'undef',
          data: {
            name: rawName
          }
        })
      }

      /** @param {KDirective} node */
      templateBodyVisitor[
        "KAttribute[directive=true][key.name.name='bind'][key.argument.name='is'], KAttribute[directive=true][key.name.name='is']"
      ] = (node) => {
        if (
          !node.value ||
          node.value.type !== 'KExpressionContainer' ||
          !node.value.expression
        )
          return

        if (node.value.expression.type === 'Literal') {
          verifyName(`${node.value.expression.value}`, node)
        }
      }
    }

    return utils.defineTemplateBodyVisitor(
      context,
      templateBodyVisitor,
      scriptVisitor
    )
  }
}
