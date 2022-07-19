import * as ES from './es-ast'
import * as K from './k-ast'
import * as TS from './ts-ast'
import * as JSX from './jsx-ast'
import {KExpressionContainer, KLiteral} from "./k-ast";

export type ASTNode = ES.ESNode | K.KNode | TS.TSNode | JSX.JSXNode

export type ParamNode = never // You specify the node type in JSDoc.

export type KNodeListenerMap = {
  KAttribute: K.KAttribute | K.KDirective
  'KAttribute:exit': K.KAttribute | K.KDirective
  'KAttribute[directive=false]': K.KAttribute
  'KAttribute[directive=false]:exit': K.KAttribute
  "KAttribute[directive=true][key.name.name='bind']": K.KDirective & {
    value:
      | (K.KExpressionContainer & {
          expression: ES.Expression | K.KFilterSequenceExpression | null
        })
      | null
  }
  "KAttribute[directive=true][key.name.name='bind']:exit": K.KDirective & {
    value:
      | (K.KExpressionContainer & {
          expression: ES.Expression | K.KFilterSequenceExpression | null
        })
      | null
  }
  "KAttribute[directive=true][key.name.name='cloak']": K.KDirective
  "KAttribute[directive=true][key.name.name='cloak']:exit": K.KDirective
  "KAttribute[directive=true][key.name.name='else-if']": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='else-if']:exit": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='else']": K.KDirective
  "KAttribute[directive=true][key.name.name='else']:exit": K.KDirective
  "KAttribute[directive=true][key.name.name='for']": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: K.KForExpression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='for']:exit": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: K.KForExpression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='html']": K.KDirective
  "KAttribute[directive=true][key.name.name='html']:exit": K.KDirective
  "KAttribute[directive=true][key.name.name='if']": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='if']:exit": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='is']": K.KDirective
  "KAttribute[directive=true][key.name.name='is']:exit": K.KDirective
  "KAttribute[directive=true][key.name.name='model']": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='model']:exit": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='memo']": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='memo']:exit": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='on']": K.KDirective & {
    value:
      | (K.KExpressionContainer & {
          expression: ES.Expression | K.KOnExpression | null
        })
      | null
  }
  "KAttribute[directive=true][key.name.name='on']:exit": K.KDirective & {
    value:
      | (K.KExpressionContainer & {
          expression: ES.Expression | K.KOnExpression | null
        })
      | null
  }
  "KAttribute[directive=true][key.name.name='once']": K.KDirective
  "KAttribute[directive=true][key.name.name='once']:exit": K.KDirective
  "KAttribute[directive=true][key.name.name='pre']": K.KDirective
  "KAttribute[directive=true][key.name.name='pre']:exit": K.KDirective
  "KAttribute[directive=true][key.name.name='show']": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='show']:exit": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: ES.Expression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='slot']": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: K.KSlotScopeExpression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='slot']:exit": K.KDirective & {
    value:
      | (K.KExpressionContainer & { expression: K.KSlotScopeExpression | null })
      | null
  }
  "KAttribute[directive=true][key.name.name='text']": K.KDirective
  "KAttribute[directive=true][key.name.name='text']:exit": K.KDirective
  'KAttribute[value!=null]':
    | (K.KAttribute & { value: KLiteral })
    | (K.KDirective & { value: KExpressionContainer })
  // KDirective: K.KDirective
  // 'KDirective:exit': K.KDirective
  KDirectiveKey: K.KDirectiveKey
  'KDirectiveKey:exit': K.KDirectiveKey
  KElement: K.KElement
  'KElement:exit': K.KElement
  KEndTag: K.KEndTag
  'KEndTag:exit': K.KEndTag
  KExpressionContainer: K.KExpressionContainer
  'KExpressionContainer:exit': K.KExpressionContainer
  KIdentifier: K.KIdentifier
  'KIdentifier:exit': K.KIdentifier
  KLiteral: K.KLiteral
  'KLiteral:exit': K.KLiteral
  KStartTag: K.KStartTag
  'KStartTag:exit': K.KStartTag
  KText: K.KText
  'KText:exit': K.KText
  KForExpression: K.KForExpression
  'KForExpression:exit': K.KForExpression
  KOnExpression: K.KOnExpression
  'KOnExpression:exit': K.KOnExpression
  KSlotScopeExpression: K.KSlotScopeExpression
  'KSlotScopeExpression:exit': K.KSlotScopeExpression
  KFilterSequenceExpression: K.KFilterSequenceExpression
  'KFilterSequenceExpression:exit': K.KFilterSequenceExpression
  KFilter: K.KFilter
  'KFilter:exit': K.KFilter
  KDocumentFragment: K.KDocumentFragment
  'KDocumentFragment:exit': K.KDocumentFragment
} & ESNodeListenerMap
export type NodeListenerMap = {
  JSXAttribute: JSX.JSXAttribute
  'JSXAttribute:exit': JSX.JSXAttribute
  JSXClosingElement: JSX.JSXClosingElement
  'JSXClosingElement:exit': JSX.JSXClosingElement
  JSXClosingFragment: JSX.JSXClosingFragment
  'JSXClosingFragment:exit': JSX.JSXClosingFragment
  JSXElement: JSX.JSXElement
  'JSXElement:exit': JSX.JSXElement
  JSXEmptyExpression: JSX.JSXEmptyExpression
  'JSXEmptyExpression:exit': JSX.JSXEmptyExpression
  JSXExpressionContainer: JSX.JSXExpressionContainer
  'JSXExpressionContainer:exit': JSX.JSXExpressionContainer
  JSXFragment: JSX.JSXFragment
  'JSXFragment:exit': JSX.JSXFragment
  JSXIdentifier: JSX.JSXIdentifier
  'JSXIdentifier:exit': JSX.JSXIdentifier
  JSXOpeningElement: JSX.JSXOpeningElement
  'JSXOpeningElement:exit': JSX.JSXOpeningElement
  JSXOpeningFragment: JSX.JSXOpeningFragment
  'JSXOpeningFragment:exit': JSX.JSXOpeningFragment
  JSXSpreadAttribute: JSX.JSXSpreadAttribute
  'JSXSpreadAttribute:exit': JSX.JSXSpreadAttribute
  JSXSpreadChild: JSX.JSXSpreadChild
  'JSXSpreadChild:exit': JSX.JSXSpreadChild
  JSXMemberExpression: JSX.JSXMemberExpression
  'JSXMemberExpression:exit': JSX.JSXMemberExpression
  JSXText: JSX.JSXText
  'JSXText:exit': JSX.JSXText
} & ESNodeListenerMap
export type ESNodeListenerMap = {
  Identifier: ES.Identifier
  'Identifier:exit': ES.Identifier
  PrivateIdentifier: ES.PrivateIdentifier
  'PrivateIdentifier:exit': ES.PrivateIdentifier
  Literal: ES.Literal
  'Literal:exit': ES.Literal
  Program: ES.Program
  'Program:exit': ES.Program
  SwitchCase: ES.SwitchCase
  'SwitchCase:exit': ES.SwitchCase
  CatchClause: ES.CatchClause
  'CatchClause:exit': ES.CatchClause
  VariableDeclarator: ES.VariableDeclarator
  'VariableDeclarator:exit': ES.VariableDeclarator
  ':statement': ES.Statement
  ':statement:exit': ES.Statement
  ExpressionStatement: ES.ExpressionStatement
  'ExpressionStatement:exit': ES.ExpressionStatement
  BlockStatement: ES.BlockStatement
  'BlockStatement:exit': ES.BlockStatement
  EmptyStatement: ES.EmptyStatement
  'EmptyStatement:exit': ES.EmptyStatement
  DebuggerStatement: ES.DebuggerStatement
  'DebuggerStatement:exit': ES.DebuggerStatement
  WithStatement: ES.WithStatement
  'WithStatement:exit': ES.WithStatement
  ReturnStatement: ES.ReturnStatement
  'ReturnStatement:exit': ES.ReturnStatement
  LabeledStatement: ES.LabeledStatement
  'LabeledStatement:exit': ES.LabeledStatement
  BreakStatement: ES.BreakStatement
  'BreakStatement:exit': ES.BreakStatement
  ContinueStatement: ES.ContinueStatement
  'ContinueStatement:exit': ES.ContinueStatement
  IfStatement: ES.IfStatement
  'IfStatement:exit': ES.IfStatement
  SwitchStatement: ES.SwitchStatement
  'SwitchStatement:exit': ES.SwitchStatement
  ThrowStatement: ES.ThrowStatement
  'ThrowStatement:exit': ES.ThrowStatement
  TryStatement: ES.TryStatement
  'TryStatement:exit': ES.TryStatement
  WhileStatement: ES.WhileStatement
  'WhileStatement:exit': ES.WhileStatement
  DoWhileStatement: ES.DoWhileStatement
  'DoWhileStatement:exit': ES.DoWhileStatement
  ForStatement: ES.ForStatement
  'ForStatement:exit': ES.ForStatement
  ForInStatement: ES.ForInStatement
  'ForInStatement:exit': ES.ForInStatement
  ForOfStatement: ES.ForOfStatement
  'ForOfStatement:exit': ES.ForOfStatement
  ':declaration': ES.Declaration
  ':declaration:exit': ES.Declaration
  FunctionDeclaration: ES.FunctionDeclaration
  'FunctionDeclaration:exit': ES.FunctionDeclaration
  VariableDeclaration: ES.VariableDeclaration
  'VariableDeclaration:exit': ES.VariableDeclaration
  ClassDeclaration: ES.ClassDeclaration
  'ClassDeclaration:exit': ES.ClassDeclaration
  ':expression': ES.Expression
  ':expression:exit': ES.Expression
  ThisExpression: ES.ThisExpression
  'ThisExpression:exit': ES.ThisExpression
  ArrayExpression: ES.ArrayExpression
  'ArrayExpression:exit': ES.ArrayExpression
  ObjectExpression: ES.ObjectExpression
  'ObjectExpression:exit': ES.ObjectExpression
  ':function':
    | ES.FunctionExpression
    | ES.ArrowFunctionExpression
    | ES.FunctionDeclaration
  ':function:exit':
    | ES.FunctionExpression
    | ES.ArrowFunctionExpression
    | ES.FunctionDeclaration
  FunctionExpression: ES.FunctionExpression
  'FunctionExpression:exit': ES.FunctionExpression
  ArrowFunctionExpression: ES.ArrowFunctionExpression
  'ArrowFunctionExpression:exit': ES.ArrowFunctionExpression
  YieldExpression: ES.YieldExpression
  'YieldExpression:exit': ES.YieldExpression
  UnaryExpression: ES.UnaryExpression
  'UnaryExpression:exit': ES.UnaryExpression
  UpdateExpression: ES.UpdateExpression
  'UpdateExpression:exit': ES.UpdateExpression
  BinaryExpression: ES.BinaryExpression
  'BinaryExpression:exit': ES.BinaryExpression
  AssignmentExpression: ES.AssignmentExpression
  'AssignmentExpression:exit': ES.AssignmentExpression
  LogicalExpression: ES.LogicalExpression
  'LogicalExpression:exit': ES.LogicalExpression
  MemberExpression: ES.MemberExpression
  'MemberExpression:exit': ES.MemberExpression
  ConditionalExpression: ES.ConditionalExpression
  'ConditionalExpression:exit': ES.ConditionalExpression
  CallExpression: ES.CallExpression
  'CallExpression:exit': ES.CallExpression
  NewExpression: ES.NewExpression
  'NewExpression:exit': ES.NewExpression
  SequenceExpression: ES.SequenceExpression
  'SequenceExpression:exit': ES.SequenceExpression
  TemplateLiteral: ES.TemplateLiteral
  'TemplateLiteral:exit': ES.TemplateLiteral
  TaggedTemplateExpression: ES.TaggedTemplateExpression
  'TaggedTemplateExpression:exit': ES.TaggedTemplateExpression
  ClassExpression: ES.ClassExpression
  'ClassExpression:exit': ES.ClassExpression
  MetaProperty: ES.MetaProperty
  'MetaProperty:exit': ES.MetaProperty
  AwaitExpression: ES.AwaitExpression
  'AwaitExpression:exit': ES.AwaitExpression
  Property: ES.Property | ES.AssignmentProperty
  'Property:exit': ES.Property | ES.AssignmentProperty
  'ObjectExpression>Property': ES.Property
  'ObjectExpression>Property:exit': ES.Property
  'ObjectExpression > Property': ES.Property
  'ObjectExpression > Property:exit': ES.Property
  'ObjectPattern>Property': ES.AssignmentProperty
  'ObjectPattern>Property:exit': ES.AssignmentProperty
  'ObjectPattern > Property': ES.AssignmentProperty
  'ObjectPattern > Property:exit': ES.AssignmentProperty
  Super: ES.Super
  'Super:exit': ES.Super
  TemplateElement: ES.TemplateElement
  'TemplateElement:exit': ES.TemplateElement
  SpreadElement: ES.SpreadElement
  'SpreadElement:exit': ES.SpreadElement
  ':pattern': ES.Pattern
  ':pattern:exit': ES.Pattern
  ObjectPattern: ES.ObjectPattern
  'ObjectPattern:exit': ES.ObjectPattern
  ArrayPattern: ES.ArrayPattern
  'ArrayPattern:exit': ES.ArrayPattern
  RestElement: ES.RestElement
  'RestElement:exit': ES.RestElement
  AssignmentPattern: ES.AssignmentPattern
  'AssignmentPattern:exit': ES.AssignmentPattern
  ClassBody: ES.ClassBody
  'ClassBody:exit': ES.ClassBody
  MethodDefinition: ES.MethodDefinition
  'MethodDefinition:exit': ES.MethodDefinition
  PropertyDefinition: ES.PropertyDefinition
  'PropertyDefinition:exit': ES.PropertyDefinition
  StaticBlock: ES.StaticBlock
  'StaticBlock:exit': ES.StaticBlock
  ImportDeclaration: ES.ImportDeclaration
  'ImportDeclaration:exit': ES.ImportDeclaration
  ExportNamedDeclaration: ES.ExportNamedDeclaration
  'ExportNamedDeclaration:exit': ES.ExportNamedDeclaration
  ExportDefaultDeclaration: ES.ExportDefaultDeclaration
  'ExportDefaultDeclaration:exit': ES.ExportDefaultDeclaration
  ExportAllDeclaration: ES.ExportAllDeclaration
  'ExportAllDeclaration:exit': ES.ExportAllDeclaration
  ImportSpecifier: ES.ImportSpecifier
  'ImportSpecifier:exit': ES.ImportSpecifier
  ImportDefaultSpecifier: ES.ImportDefaultSpecifier
  'ImportDefaultSpecifier:exit': ES.ImportDefaultSpecifier
  ImportNamespaceSpecifier: ES.ImportNamespaceSpecifier
  'ImportNamespaceSpecifier:exit': ES.ImportNamespaceSpecifier
  ExportSpecifier: ES.ExportSpecifier
  'ExportSpecifier:exit': ES.ExportSpecifier
  ImportExpression: ES.ImportExpression
  'ImportExpression:exit': ES.ImportExpression
  ChainExpression: ES.ChainExpression
  'ChainExpression:exit': ES.ChainExpression

  TSAsExpression: TS.TSAsExpression
  'TSAsExpression:exit': TS.TSAsExpression
}
