/**
 * @fileoverview Report used components
 * @author NKDuy
 */
'use strict'

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
    type: 'suggestion',
    docs: {
      description:
        'disallow registering components that are not used inside templates',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-unused-components.html'
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          ignoreWhenBindingPresent: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    const options = context.options[0] || {}
    const ignoreWhenBindingPresent =
      options.ignoreWhenBindingPresent !== undefined
        ? options.ignoreWhenBindingPresent
        : true
    const usedComponents = new Set()
    /** @type { { node: Property, name: string }[] } */
    let registeredComponents = []
    let ignoreReporting = false
    /** @type {Position} */
    let templateLocation

    return utils.defineTemplateBodyVisitor(
      context,
      {
        /** @param {KElement} node */
        KElement(node) {
          if (
            (!utils.isHtmlElementNode(node) && !utils.isSvgElementNode(node)) ||
            utils.isHtmlWellKnownElementName(node.rawName) ||
            utils.isSvgWellKnownElementName(node.rawName)
          ) {
            return
          }

          usedComponents.add(node.rawName)
        },
        /** @param {KDirective} node */
        "KAttribute[directive=true][key.name.name='bind'][key.argument.name='is'], KAttribute[directive=true][key.name.name='is']"(
          node
        ) {
          if (
            !node.value || // `<component :is>`
            node.value.type !== 'KExpressionContainer' ||
            !node.value.expression // `<component :is="">`
          )
            return

          if (node.value.expression.type === 'Literal') {
            usedComponents.add(node.value.expression.value)
          } else if (ignoreWhenBindingPresent) {
            ignoreReporting = true
          }
        },
        /** @param {KAttribute} node */
        "KAttribute[directive=false][key.name='is']"(node) {
          if (!node.value) {
            return
          }
          const value = node.value.value.startsWith('kdu:') // Usage on native elements 3.1+
            ? node.value.value.slice(4)
            : node.value.value
          usedComponents.add(value)
        },
        /** @param {KElement} node */
        "KElement[name='template']"(node) {
          templateLocation = templateLocation || node.loc.start
        },
        /** @param {KElement} node */
        "KElement[name='template']:exit"(node) {
          if (
            node.loc.start !== templateLocation ||
            ignoreReporting ||
            utils.hasAttribute(node, 'src')
          )
            return

          registeredComponents
            .filter(({ name }) => {
              // If the component name is PascalCase or camelCase
              // it can be used in various of ways inside template,
              // like "theComponent", "The-component" etc.
              // but except snake_case
              if (casing.isPascalCase(name) || casing.isCamelCase(name)) {
                return ![...usedComponents].some((n) => {
                  return (
                    n.indexOf('_') === -1 &&
                    (name === casing.pascalCase(n) ||
                      casing.camelCase(n) === name)
                  )
                })
              } else {
                // In any other case the used component name must exactly match
                // the registered name
                return !usedComponents.has(name)
              }
            })
            .forEach(({ node, name }) =>
              context.report({
                node,
                message:
                  'The "{{name}}" component has been registered but not used.',
                data: {
                  name
                }
              })
            )
        }
      },
      utils.executeOnKdu(context, (obj) => {
        registeredComponents = utils.getRegisteredComponents(obj)
      })
    )
  }
}
