/**
 * @see https://github.com/kdujs/kdu-eslint-parser/blob/master/docs/ast.md
 */
import { HasParentNode, BaseNode } from '../node'
import { Token, HTMLComment, HTMLBogusComment, Comment } from '../node'
import { ParseError } from '../errors'
import * as ES from './es-ast'

export type NS = {
  HTML: 'http://www.w3.org/1999/xhtml'
  MathML: 'http://www.w3.org/1998/Math/MathML'
  SVG: 'http://www.w3.org/2000/svg'
  XLink: 'http://www.w3.org/1999/xlink'
  XML: 'http://www.w3.org/XML/1998/namespace'
  XMLNS: 'http://www.w3.org/2000/xmlns/'
}
export type Namespace =
  | NS['HTML']
  | NS['MathML']
  | NS['SVG']
  | NS['XLink']
  | NS['XML']
  | NS['XMLNS']
export interface KVariable {
  id: ES.Identifier
  kind: 'k-for' | 'scope'
  references: KReference[]
}
export interface KReference {
  id: ES.Identifier
  mode: 'rw' | 'r' | 'w'
  variable: KVariable | null
}
export interface KForExpression extends HasParentNode {
  type: 'KForExpression'
  parent: KExpressionContainer
  left: ES.Pattern[]
  right: ES.Expression
}
export interface KOnExpression extends HasParentNode {
  type: 'KOnExpression'
  parent: KExpressionContainer
  body: ES.Statement[]
}
export interface KSlotScopeExpression extends HasParentNode {
  type: 'KSlotScopeExpression'
  parent: KExpressionContainer
  params: ES._FunctionParameter[]
}
export interface KFilterSequenceExpression extends HasParentNode {
  type: 'KFilterSequenceExpression'
  parent: KExpressionContainer
  expression: ES.Expression
  filters: KFilter[]
}
export interface KFilter extends HasParentNode {
  type: 'KFilter'
  parent: KFilterSequenceExpression
  callee: ES.Identifier
  arguments: (ES.Expression | ES.SpreadElement)[]
}
export type KNode =
  | KAttribute
  | KDirective
  | KDirectiveKey
  | KElement
  | KEndTag
  | KExpressionContainer
  | KIdentifier
  | KLiteral
  | KStartTag
  | KText
  | KDocumentFragment
  | KForExpression
  | KOnExpression
  | KSlotScopeExpression
  | KFilterSequenceExpression
  | KFilter

export interface KText extends HasParentNode {
  type: 'KText'
  parent: KDocumentFragment | KElement
  value: string
}
export interface KExpressionContainer extends HasParentNode {
  type: 'KExpressionContainer'
  parent: KDocumentFragment | KElement | KDirective | KDirectiveKey
  expression:
    | ES.Expression
    | KFilterSequenceExpression
    | KForExpression
    | KOnExpression
    | KSlotScopeExpression
    | null
  references: KReference[]
}
export interface KIdentifier extends HasParentNode {
  type: 'KIdentifier'
  parent: KAttribute | KDirectiveKey
  name: string
  rawName: string
}
export interface KDirectiveKey extends HasParentNode {
  type: 'KDirectiveKey'
  parent: KDirective
  name: KIdentifier
  argument: KExpressionContainer | KIdentifier | null
  modifiers: KIdentifier[]
}
export interface KLiteral extends HasParentNode {
  type: 'KLiteral'
  parent: KAttribute
  value: string
}
export interface KAttribute extends HasParentNode {
  type: 'KAttribute'
  parent: KStartTag
  directive: false
  key: KIdentifier
  value: KLiteral | null
}
export interface KDirective extends HasParentNode {
  type: 'KAttribute'
  parent: KStartTag
  directive: true
  key: KDirectiveKey
  value: KExpressionContainer | null
}
export interface KStartTag extends HasParentNode {
  type: 'KStartTag'
  parent: KElement
  selfClosing: boolean
  attributes: (KAttribute | KDirective)[]
}
export interface KEndTag extends HasParentNode {
  type: 'KEndTag'
  parent: KElement
}
interface HasConcreteInfo {
  tokens: Token[]
  comments: (HTMLComment | HTMLBogusComment | Comment)[]
  errors: ParseError[]
}
export interface KRootElement extends HasParentNode, HasConcreteInfo {
  type: 'KElement'
  parent: KDocumentFragment
  namespace: Namespace
  name: string
  rawName: string
  startTag: KStartTag
  children: (KElement | KText | KExpressionContainer)[]
  endTag: KEndTag | null
  variables: KVariable[]
}

interface KChildElement extends HasParentNode {
  type: 'KElement'
  parent: KRootElement | KElement
  namespace: Namespace
  name: string
  rawName: string
  startTag: KStartTag
  children: (KElement | KText | KExpressionContainer)[]
  endTag: KEndTag | null
  variables: KVariable[]
}

export type KElement = KChildElement | KRootElement

export interface KDocumentFragment extends BaseNode, HasConcreteInfo {
  type: 'KDocumentFragment'
  parent: null
  children: (KElement | KText | KExpressionContainer)[]
}
