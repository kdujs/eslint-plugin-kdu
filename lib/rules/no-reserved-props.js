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

/**
 * @typedef {import('../utils').ComponentArrayProp} ComponentArrayProp
 * @typedef {import('../utils').ComponentObjectProp} ComponentObjectProp
 * @typedef {import('../utils').ComponentTypeProp} ComponentTypeProp
 */

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const RESERVED = {
  3: ['key', 'ref'],
  2: ['key', 'ref', 'is', 'slot', 'slot-scope', 'slotScope', 'class', 'style']
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow reserved names in props',
      categories: ['kdu3-essential', 'essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-reserved-props.html',
      defaultOptions: {
        kdu2: [{ kduVersion: 2 }]
      }
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          kduVersion: {
            enum: [2, 3]
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      reserved:
        "'{{propName}}' is a reserved attribute and cannot be used as props."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const options = context.options[0] || {}
    /** @type {2|3} */
    const kduVersion = options.kduVersion || 3

    const reserved = new Set(RESERVED[kduVersion])

    /**
     * @param {(ComponentArrayProp | ComponentObjectProp | ComponentTypeProp)[]} props
     */
    function processProps(props) {
      for (const prop of props) {
        if (prop.propName != null && reserved.has(prop.propName)) {
          context.report({
            node: prop.node,
            messageId: `reserved`,
            data: {
              propName: casing.kebabCase(prop.propName)
            }
          })
        }
      }
    }

    return utils.compositingVisitors(
      utils.defineScriptSetupVisitor(context, {
        onDefinePropsEnter(_node, props) {
          processProps(props)
        }
      }),
      utils.executeOnKdu(context, (obj) => {
        processProps(utils.getComponentProps(obj))
      })
    )
  }
}
