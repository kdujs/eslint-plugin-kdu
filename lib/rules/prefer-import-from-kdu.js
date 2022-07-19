/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const kdu3ExportNames = new Set(require('../utils/kdu3-export-names.json'))

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const TARGET_AT_KDU_MODULES = new Set([
  '@kdujs/runtime-dom',
  '@kdujs/runtime-core',
  '@kdujs/reactivity',
  '@kdujs/shared'
])
// Modules with the names of a subset of kdu.
const SUBSET_AT_KDU_MODULES = new Set(['@kdujs/runtime-dom', '@kdujs/runtime-core'])

/**
 * @param {ImportDeclaration} node
 */
function* extractImportNames(node) {
  for (const specifier of node.specifiers) {
    if (specifier.type === 'ImportDefaultSpecifier') {
      yield 'default'
    } else if (specifier.type === 'ImportNamespaceSpecifier') {
      yield null // all
    } else if (specifier.type === 'ImportSpecifier') {
      yield specifier.imported.name
    }
  }
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "enforce import from 'kdu' instead of import from '@kdujs/*'",
      // TODO We will change it in the next major version.
      // categories: ['kdu3-essential'],
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/prefer-import-from-kdu.html'
    },
    fixable: 'code',
    schema: [],
    messages: {
      importedAtKdu: "Import from 'kdu' instead of '{{source}}'."
    }
  },
  /**
   * @param {RuleContext} context
   * @returns {RuleListener}
   */
  create(context) {
    /**
     *
     * @param {Literal & { value: string }} source
     * @param { () => boolean } fixable
     */
    function verifySource(source, fixable) {
      if (!TARGET_AT_KDU_MODULES.has(source.value)) {
        return
      }

      context.report({
        node: source,
        messageId: 'importedAtKdu',
        data: { source: source.value },
        fix: fixable()
          ? (fixer) =>
              fixer.replaceTextRange(
                [source.range[0] + 1, source.range[1] - 1],
                'kdu'
              )
          : null
      })
    }

    return {
      ImportDeclaration(node) {
        verifySource(node.source, () => {
          if (SUBSET_AT_KDU_MODULES.has(node.source.value)) {
            // If the module is a subset of 'kdu', we can safely change it to 'kdu'.
            return true
          }
          for (const name of extractImportNames(node)) {
            if (name == null) {
              return false // import all
            }
            if (!kdu3ExportNames.has(name)) {
              // If there is a name that is not exported from 'kdu', it will not be auto-fixed.
              return false
            }
          }
          return true
        })
      },
      ExportNamedDeclaration(node) {
        if (node.source) {
          verifySource(node.source, () => {
            for (const specifier of node.specifiers) {
              if (!kdu3ExportNames.has(specifier.local.name)) {
                // If there is a name that is not exported from 'kdu', it will not be auto-fixed.
                return false
              }
            }
            return true
          })
        }
      },
      ExportAllDeclaration(node) {
        verifySource(
          node.source,
          // If we change it to `from 'kdu'`, it will export more, so it will not be auto-fixed.
          () => false
        )
      }
    }
  }
}
