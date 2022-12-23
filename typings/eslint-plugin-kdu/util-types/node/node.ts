import { HasLocation } from './locations'
import * as KAST from '../ast'

export interface BaseNode extends HasLocation {
  type: string
  parent: KAST.ASTNode | null
}

export interface HasParentNode extends BaseNode {
  parent: KAST.ASTNode
}
