/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const semver = require('semver')
const utils = require('../utils')

/**
 * @typedef {object} SyntaxRule
 * @property {string} supported
 * @property { (context: RuleContext) => TemplateListener } [createTemplateBodyVisitor]
 * @property { (context: RuleContext) => RuleListener } [createScriptVisitor]
 */

const FEATURES = {
  // Kdu.js 2.5.0+
  'slot-scope-attribute': require('./syntaxes/slot-scope-attribute'),
  // Kdu.js 2.6.0+
  'dynamic-directive-arguments': require('./syntaxes/dynamic-directive-arguments'),
  'k-slot': require('./syntaxes/k-slot'),
  // Kdu.js 3.0.0+
  'k-model-argument': require('./syntaxes/k-model-argument'),
  'k-model-custom-modifiers': require('./syntaxes/k-model-custom-modifiers'),
  'k-is': require('./syntaxes/k-is'),
  'script-setup': require('./syntaxes/script-setup'),
  'style-css-vars-injection': require('./syntaxes/style-css-vars-injection'),
  // Kdu.js 3.1.0+
  'is-attribute-with-kdu-prefix': require('./syntaxes/is-attribute-with-kdu-prefix'),
  // Kdu.js 3.2.0+
  'k-memo': require('./syntaxes/k-memo'),
  'k-bind-prop-modifier-shorthand': require('./syntaxes/k-bind-prop-modifier-shorthand'),
  'k-bind-attr-modifier': require('./syntaxes/k-bind-attr-modifier')
}

const SYNTAX_NAMES = /** @type {(keyof FEATURES)[]} */ (Object.keys(FEATURES))

const cache = new Map()
/**
 * Get the `semver.Range` object of a given range text.
 * @param {string} x The text expression for a semver range.
 * @returns {semver.Range} The range object of a given range text.
 * It's null if the `x` is not a valid range text.
 */
function getSemverRange(x) {
  const s = String(x)
  let ret = cache.get(s) || null

  if (!ret) {
    try {
      ret = new semver.Range(s)
    } catch (_error) {
      // Ignore parsing error.
    }
    cache.set(s, ret)
  }

  return ret
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow unsupported Kdu.js syntax on the specified version',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-unsupported-features.html'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          version: {
            type: 'string'
          },
          ignores: {
            type: 'array',
            items: {
              enum: SYNTAX_NAMES
            },
            uniqueItems: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      // Kdu.js 2.5.0+
      forbiddenSlotScopeAttribute:
        '`slot-scope` are not supported except Kdu.js ">=2.5.0 <3.0.0".',
      // Kdu.js 2.6.0+
      forbiddenDynamicDirectiveArguments:
        'Dynamic arguments are not supported until Kdu.js "2.6.0".',
      forbiddenKSlot: '`k-slot` are not supported until Kdu.js "2.6.0".',
      // Kdu.js 3.0.0+
      forbiddenKModelArgument:
        'Argument on `k-model` is not supported until Kdu.js "3.0.0".',
      forbiddenKModelCustomModifiers:
        'Custom modifiers on `k-model` are not supported until Kdu.js "3.0.0".',
      forbiddenKIs: '`k-is` are not supported until Kdu.js "3.0.0".',
      forbiddenScriptSetup:
        '`<script setup>` are not supported until Kdu.js "3.0.0".',
      forbiddenStyleCssVarsInjection:
        'SFC CSS variable injection is not supported until Kdu.js "3.0.3".',
      // Kdu.js 3.1.0+
      forbiddenIsAttributeWithKduPrefix:
        '`is="kdu:"` are not supported until Kdu.js "3.1.0".',
      // Kdu.js 3.2.0+
      forbiddenKMemo: '`k-memo` are not supported until Kdu.js "3.2.0".',
      forbiddenKBindPropModifierShorthand:
        '`.prop` shorthand are not supported until Kdu.js "3.2.0".',
      forbiddenKBindAttrModifier:
        '`.attr` modifiers on `k-bind` are not supported until Kdu.js "3.2.0".'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const { version, ignores } = Object.assign(
      {
        version: null,
        ignores: []
      },
      context.options[0] || {}
    )
    if (!version) {
      // version is not set.
      return {}
    }
    const versionRange = getSemverRange(version)

    /**
     * Check whether a given case object is full-supported on the configured node version.
     * @param {SyntaxRule} aCase The case object to check.
     * @returns {boolean} `true` if it's supporting.
     */
    function isNotSupportingVersion(aCase) {
      return !semver.subset(versionRange, getSemverRange(aCase.supported))
    }

    /** @type {TemplateListener} */
    let templateBodyVisitor = {}
    /** @type {RuleListener} */
    let scriptVisitor = {}

    for (const syntaxName of SYNTAX_NAMES) {
      /** @type {SyntaxRule} */
      const syntax = FEATURES[syntaxName]
      if (ignores.includes(syntaxName) || !isNotSupportingVersion(syntax)) {
        continue
      }
      if (syntax.createTemplateBodyVisitor) {
        const visitor = syntax.createTemplateBodyVisitor(context)
        templateBodyVisitor = utils.compositingVisitors(
          templateBodyVisitor,
          visitor
        )
      }
      if (syntax.createScriptVisitor) {
        const visitor = syntax.createScriptVisitor(context)
        scriptVisitor = utils.compositingVisitors(scriptVisitor, visitor)
      }
    }

    return utils.defineTemplateBodyVisitor(
      context,
      templateBodyVisitor,
      scriptVisitor
    )
  }
}
