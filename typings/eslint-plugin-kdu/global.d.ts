import * as KAST from './util-types/ast'
import * as KNODE from './util-types/node'
import * as parserServices from './util-types/parser-services'
import * as eslint from 'eslint'

declare global {
  // **** Rule Helpers ****
  type RuleModule = eslint.Rule.RuleModule
  type RuleContext = eslint.Rule.RuleContext
  namespace Rule {
    type ReportDescriptor = eslint.Rule.ReportDescriptor
    type SuggestionReportDescriptor = eslint.Rule.SuggestionReportDescriptor
  }
  type SourceCode = eslint.SourceCode
  namespace SourceCode {
    type CursorWithSkipOptions = eslint.SourceCode.CursorWithSkipOptions
    type CursorWithCountOptions = eslint.SourceCode.CursorWithCountOptions
  }
  type RuleFixer = eslint.Rule.RuleFixer
  type Fix = eslint.Rule.Fix

  type NodeListener = eslint.Rule.NodeListener
  type RuleListener = eslint.Rule.RuleListener
  type TemplateListener = parserServices.TemplateListener
  type ParserServices = parserServices.ParserServices
  namespace ParserServices {
    type TokenStore = parserServices.ParserServices.TokenStore
  }

  // **** Node data ****

  type Range = KNODE.Range
  type Position = KNODE.Position
  type SourceLocation = KNODE.SourceLocation
  type Token = KNODE.Token
  type Comment = KNODE.Comment
  type HTMLComment = KNODE.HTMLComment
  type HTMLBogusComment = KNODE.HTMLBogusComment

  type NodeListenerMap = KAST.NodeListenerMap
  type KNodeListenerMap = KAST.KNodeListenerMap

  // **** AST nodes ****

  type ASTNode = KAST.ASTNode
  type ESNode = KAST.ESNode
  type KNode = KAST.KNode
  type TSNode = KAST.TSNode
  type JSXNode = KAST.JSXNode

  // ---- Kdu Template Nodes ----

  type KAttribute = KAST.KAttribute
  type KDirective = KAST.KDirective
  type KDirectiveKey = KAST.KDirectiveKey
  type KDocumentFragment = KAST.KDocumentFragment
  type KElement = KAST.KElement
  type KRootElement = KAST.KRootElement
  type KEndTag = KAST.KEndTag
  type KExpressionContainer = KAST.KExpressionContainer
  type KIdentifier = KAST.KIdentifier
  type KLiteral = KAST.KLiteral
  type KStartTag = KAST.KStartTag
  type KText = KAST.KText
  type KForExpression = KAST.KForExpression
  type KOnExpression = KAST.KOnExpression
  type KSlotScopeExpression = KAST.KSlotScopeExpression
  type KFilterSequenceExpression = KAST.KFilterSequenceExpression
  type KFilter = KAST.KFilter

  // ---- ES Nodes ----

  type Identifier = KAST.Identifier
  type PrivateIdentifier = KAST.PrivateIdentifier
  type Literal = KAST.Literal
  type Program = KAST.Program
  type SwitchCase = KAST.SwitchCase
  type CatchClause = KAST.CatchClause
  type VariableDeclarator = KAST.VariableDeclarator
  type Statement = KAST.Statement
  type ExpressionStatement = KAST.ExpressionStatement
  type BlockStatement = KAST.BlockStatement
  type EmptyStatement = KAST.EmptyStatement
  type DebuggerStatement = KAST.DebuggerStatement
  type WithStatement = KAST.WithStatement
  type ReturnStatement = KAST.ReturnStatement
  type LabeledStatement = KAST.LabeledStatement
  type BreakStatement = KAST.BreakStatement
  type ContinueStatement = KAST.ContinueStatement
  type IfStatement = KAST.IfStatement
  type SwitchStatement = KAST.SwitchStatement
  type ThrowStatement = KAST.ThrowStatement
  type TryStatement = KAST.TryStatement
  type WhileStatement = KAST.WhileStatement
  type DoWhileStatement = KAST.DoWhileStatement
  type ForStatement = KAST.ForStatement
  type ForInStatement = KAST.ForInStatement
  type ForOfStatement = KAST.ForOfStatement
  type Declaration = KAST.Declaration
  type FunctionDeclaration = KAST.FunctionDeclaration
  type VariableDeclaration = KAST.VariableDeclaration
  type ClassDeclaration = KAST.ClassDeclaration
  type Expression = KAST.Expression
  type ThisExpression = KAST.ThisExpression
  type ArrayExpression = KAST.ArrayExpression
  type ObjectExpression = KAST.ObjectExpression
  type FunctionExpression = KAST.FunctionExpression
  type ArrowFunctionExpression = KAST.ArrowFunctionExpression
  type YieldExpression = KAST.YieldExpression
  type UnaryExpression = KAST.UnaryExpression
  type UpdateExpression = KAST.UpdateExpression
  type BinaryExpression = KAST.BinaryExpression
  type AssignmentExpression = KAST.AssignmentExpression
  type LogicalExpression = KAST.LogicalExpression
  type MemberExpression = KAST.MemberExpression
  type ConditionalExpression = KAST.ConditionalExpression
  type CallExpression = KAST.CallExpression
  type NewExpression = KAST.NewExpression
  type SequenceExpression = KAST.SequenceExpression
  type TemplateLiteral = KAST.TemplateLiteral
  type TaggedTemplateExpression = KAST.TaggedTemplateExpression
  type ClassExpression = KAST.ClassExpression
  type MetaProperty = KAST.MetaProperty
  type AwaitExpression = KAST.AwaitExpression
  type ChainExpression = KAST.ChainExpression
  type ChainElement = KAST.ChainElement
  type Property = KAST.Property
  type AssignmentProperty = KAST.AssignmentProperty
  type Super = KAST.Super
  type TemplateElement = KAST.TemplateElement
  type SpreadElement = KAST.SpreadElement
  type Pattern = KAST.Pattern
  type ObjectPattern = KAST.ObjectPattern
  type ArrayPattern = KAST.ArrayPattern
  type RestElement = KAST.RestElement
  type AssignmentPattern = KAST.AssignmentPattern
  type ClassBody = KAST.ClassBody
  type MethodDefinition = KAST.MethodDefinition
  type PropertyDefinition = KAST.PropertyDefinition
  type StaticBlock = KAST.StaticBlock
  type ModuleDeclaration = KAST.ModuleDeclaration
  type ImportDeclaration = KAST.ImportDeclaration
  type ExportNamedDeclaration = KAST.ExportNamedDeclaration
  type ExportDefaultDeclaration = KAST.ExportDefaultDeclaration
  type ExportAllDeclaration = KAST.ExportAllDeclaration
  type ModuleSpecifier = KAST.ModuleSpecifier
  type ImportSpecifier = KAST.ImportSpecifier
  type ImportDefaultSpecifier = KAST.ImportDefaultSpecifier
  type ImportNamespaceSpecifier = KAST.ImportNamespaceSpecifier
  type ExportSpecifier = KAST.ExportSpecifier
  type ImportExpression = KAST.ImportExpression

  // ---- TS Nodes ----

  type TSAsExpression = KAST.TSAsExpression
  type TSTypeParameterInstantiation = KAST.TSTypeParameterInstantiation
  type TSPropertySignature = KAST.TSPropertySignature
  type TSMethodSignature = KAST.TSMethodSignature
  type TSLiteralType = KAST.TSLiteralType
  type TSCallSignatureDeclaration = KAST.TSCallSignatureDeclaration
  type TSFunctionType = KAST.TSFunctionType

  // ---- JSX Nodes ----

  type JSXAttribute = KAST.JSXAttribute
  type JSXClosingElement = KAST.JSXClosingElement
  type JSXClosingFragment = KAST.JSXClosingFragment
  type JSXElement = KAST.JSXElement
  type JSXEmptyExpression = KAST.JSXEmptyExpression
  type JSXExpressionContainer = KAST.JSXExpressionContainer
  type JSXFragment = KAST.JSXFragment
  type JSXIdentifier = KAST.JSXIdentifier
  type JSXOpeningElement = KAST.JSXOpeningElement
  type JSXOpeningFragment = KAST.JSXOpeningFragment
  type JSXSpreadAttribute = KAST.JSXSpreadAttribute
  type JSXSpreadChild = KAST.JSXSpreadChild
  type JSXMemberExpression = KAST.JSXMemberExpression
  type JSXText = KAST.JSXText

  // **** Variables ****

  type KVariable = KAST.KVariable
  type KReference = KAST.KReference

  type Variable = eslint.Scope.Variable
  type Reference = eslint.Scope.Reference
}
