/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

require('./update-no-layout-rules-config')
require('./update-lib-configs')
require('./update-lib-index')
require('./update-docs')
require('./update-docs-rules-index')

if (process.env.IN_VERSION_SCRIPT) {
  require('./update-kdu3-export-names')
}
