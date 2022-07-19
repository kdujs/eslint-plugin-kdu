/**
 * @fileoverview Report used components that are not registered
 * @author NKDuy
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
 * Check whether the given node is a built-in component or not.
 *
 * Includes `suspense` and `teleport` from Kdu 3.
 *
 * @param {KElement} node The start tag node to check.
 * @returns {boolean} `true` if the node is a built-in component.
 */
const isBuiltInComponent = (node) => {
  const rawName = node && casing.kebabCase(node.rawName)
  return (
    utils.isHtmlElementNode(node) &&
    !utils.isHtmlWellKnownElementName(node.rawName) &&
    utils.isBuiltInComponentName(rawName)
  )
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow using components that are not registered inside templates',
      categories: null,
      recommended: false,
      url: 'https://kdujs-eslint.web.app/rules/no-unregistered-components.html'
    },
    deprecated: true,
    replacedBy: ['no-undef-components'],
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
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    if (utils.isScriptSetup(context)) {
      return {}
    }
    const options = context.options[0] || {}
    /** @type {string[]} */
    const ignorePatterns = options.ignorePatterns || []
    /** @type { { node: KElement | KDirective | KAttribute, name: string }[] } */
    const usedComponentNodes = []
    /** @type { { node: Property, name: string }[] } */
    const registeredComponents = []

    return utils.defineTemplateBodyVisitor(
      context,
      {
        /** @param {KElement} node */
        KElement(node) {
          if (
            (!utils.isHtmlElementNode(node) && !utils.isSvgElementNode(node)) ||
            utils.isHtmlWellKnownElementName(node.rawName) ||
            utils.isSvgWellKnownElementName(node.rawName) ||
            isBuiltInComponent(node)
          ) {
            return
          }

          usedComponentNodes.push({ node, name: node.rawName })
        },
        /** @param {KDirective} node */
        "KAttribute[directive=true][key.name.name='bind'][key.argument.name='is'], KAttribute[directive=true][key.name.name='is']"(
          node
        ) {
          if (
            !node.value ||
            node.value.type !== 'KExpressionContainer' ||
            !node.value.expression
          )
            return

          if (node.value.expression.type === 'Literal') {
            if (
              utils.isHtmlWellKnownElementName(`${node.value.expression.value}`)
            )
              return
            usedComponentNodes.push({
              node,
              name: `${node.value.expression.value}`
            })
          }
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
          if (utils.isHtmlWellKnownElementName(value)) return
          usedComponentNodes.push({ node, name: value })
        },
        "KElement[name='template'][parent.type='KDocumentFragment']:exit"() {
          // All registered components, transformed to kebab-case
          const registeredComponentNames = registeredComponents.map(
            ({ name }) => casing.kebabCase(name)
          )

          // All registered components using kebab-case syntax
          const componentsRegisteredAsKebabCase = registeredComponents
            .filter(({ name }) => name === casing.kebabCase(name))
            .map(({ name }) => name)

          usedComponentNodes
            .filter(({ name }) => {
              const kebabCaseName = casing.kebabCase(name)

              // Check ignored patterns in first place
              if (
                ignorePatterns.find((pattern) => {
                  const regExp = new RegExp(pattern)
                  return (
                    regExp.test(kebabCaseName) ||
                    regExp.test(casing.pascalCase(name)) ||
                    regExp.test(casing.camelCase(name)) ||
                    regExp.test(casing.snakeCase(name)) ||
                    regExp.test(name)
                  )
                })
              )
                return false

              // Component registered as `foo-bar` cannot be used as `FooBar`
              if (
                casing.isPascalCase(name) &&
                componentsRegisteredAsKebabCase.indexOf(kebabCaseName) !== -1
              ) {
                return true
              }

              // Otherwise
              return registeredComponentNames.indexOf(kebabCaseName) === -1
            })
            .forEach(({ node, name }) =>
              context.report({
                node,
                message:
                  'The "{{name}}" component has been used but not registered.',
                data: {
                  name
                }
              })
            )
        }
      },
      utils.executeOnKdu(context, (obj) => {
        registeredComponents.push(...utils.getRegisteredComponents(obj))

        const nameProperty = utils.findProperty(obj, 'name')

        if (nameProperty) {
          if (nameProperty.value.type === 'Literal') {
            registeredComponents.push({
              node: nameProperty,
              name: `${nameProperty.value.value}`
            })
          }
        }
      })
    )
  }
}
