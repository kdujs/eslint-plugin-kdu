import { VisitorKeys } from 'eslint-visitor-keys'
import * as KAST from '../eslint-plugin-kdu/util-types/ast'
export namespace AST {
  function getFallbackKeys(node: KAST.ASTNode): string[]
  export interface Visitor {
    visitorKeys?: VisitorKeys
    enterNode(node: KAST.ASTNode, parent: KAST.ASTNode | null): void
    leaveNode(node: KAST.ASTNode, parent: KAST.ASTNode | null): void
  }
  export function traverseNodes(node: KAST.ASTNode, visitor: Visitor): void
  export { getFallbackKeys }

  export const NS: KAST.NS
}
