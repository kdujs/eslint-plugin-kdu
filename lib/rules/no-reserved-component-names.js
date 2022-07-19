/**
 * @fileoverview disallow the use of reserved names in component definitions
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')
const casing = require('../utils/casing')

const htmlElements = require('../utils/html-elements.json')
const deprecatedHtmlElements = require('../utils/deprecated-html-elements.json')
const svgElements = require('../utils/svg-elements.json')
const RESERVED_NAMES_IN_KDU = new Set(
  require('../utils/kdu2-builtin-components')
)

const RESERVED_NAMES_IN_KDU3 = new Set(
  require('../utils/kdu3-builtin-components')
)

const kebabCaseElements = [
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph'
]

/** @param {string} word  */
function isLowercase(word) {
  return /^[a-z]*$/.test(word)
}

const RESERVED_NAMES_IN_HTML = new Set([
  ...htmlElements,
  ...htmlElements.map(casing.capitalize)
])
const RESERVED_NAMES_IN_OTHERS = new Set([
  ...deprecatedHtmlElements,
  ...deprecatedHtmlElements.map(casing.capitalize),
  ...kebabCaseElements,
  ...kebabCaseElements.map(casing.pascalCase),
  ...svgElements,
  ...svgElements.filter(isLowercase).map(casing.capitalize)
])

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow the use of reserved names in component definitions',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-reserved-component-names.html'
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          disallowKduBuiltInComponents: {
            type: 'boolean'
          },
          disallowKdu3BuiltInComponents: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      reserved: 'Name "{{name}}" is reserved.',
      reservedInHtml: 'Name "{{name}}" is reserved in HTML.',
      reservedInKdu: 'Name "{{name}}" is reserved in Kdu.js.',
      reservedInKdu3: 'Name "{{name}}" is reserved in Kdu.js 3.x.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const options = context.options[0] || {}
    const disallowKduBuiltInComponents =
      options.disallowKduBuiltInComponents === true
    const disallowKdu3BuiltInComponents =
      options.disallowKdu3BuiltInComponents === true

    const reservedNames = new Set([
      ...RESERVED_NAMES_IN_HTML,
      ...(disallowKduBuiltInComponents ? RESERVED_NAMES_IN_KDU : []),
      ...(disallowKdu3BuiltInComponents ? RESERVED_NAMES_IN_KDU3 : []),
      ...RESERVED_NAMES_IN_OTHERS
    ])

    /**
     * @param {Expression | SpreadElement} node
     * @returns {node is (Literal | TemplateLiteral)}
     */
    function canVerify(node) {
      return (
        node.type === 'Literal' ||
        (node.type === 'TemplateLiteral' &&
          node.expressions.length === 0 &&
          node.quasis.length === 1)
      )
    }

    /**
     * @param {Literal | TemplateLiteral} node
     */
    function reportIfInvalid(node) {
      let name
      if (node.type === 'TemplateLiteral') {
        const quasis = node.quasis[0]
        name = quasis.value.cooked
      } else {
        name = `${node.value}`
      }
      if (reservedNames.has(name)) {
        report(node, name)
      }
    }

    /**
     * @param {ESNode} node
     * @param {string} name
     */
    function report(node, name) {
      context.report({
        node,
        messageId: RESERVED_NAMES_IN_HTML.has(name)
          ? 'reservedInHtml'
          : RESERVED_NAMES_IN_KDU.has(name)
          ? 'reservedInKdu'
          : RESERVED_NAMES_IN_KDU3.has(name)
          ? 'reservedInKdu3'
          : 'reserved',
        data: {
          name
        }
      })
    }

    return Object.assign(
      {},
      utils.executeOnCallKduComponent(context, (node) => {
        if (node.arguments.length === 2) {
          const argument = node.arguments[0]

          if (canVerify(argument)) {
            reportIfInvalid(argument)
          }
        }
      }),
      utils.executeOnKdu(context, (obj) => {
        // Report if a component has been registered locally with a reserved name.
        utils
          .getRegisteredComponents(obj)
          .filter(({ name }) => reservedNames.has(name))
          .forEach(({ node, name }) => report(node, name))

        const node = utils.findProperty(obj, 'name')

        if (!node) return
        if (!canVerify(node.value)) return
        reportIfInvalid(node.value)
      })
    )
  }
}
