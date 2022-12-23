import {
  Rule as ESLintRule,
  RuleTester as ESLintRuleTester,
  Linter as ESLintLinter
} from '../../node_modules/@types/eslint'
import * as KAST from '../eslint-plugin-kdu/util-types/ast'
import * as KNODE from '../eslint-plugin-kdu/util-types/node'
import * as parserServices from '../eslint-plugin-kdu/util-types/parser-services'

export namespace AST {
  type Token = KNODE.Token
  type Range = KNODE.Range
  type SourceLocation = KNODE.SourceLocation
  type Program = KAST.Program
}
export namespace Scope {
  interface ScopeManager {
    scopes: Scope[]
    globalScope: Scope | null
    acquire(node: KAST.ESNode | KAST.Program, inner?: boolean): Scope | null
    getDeclaredVariables(node: KAST.ESNode): Variable[]
  }
  interface Scope {
    type:
      | 'block'
      | 'catch'
      | 'class'
      | 'for'
      | 'function'
      | 'function-expression-name'
      | 'global'
      | 'module'
      | 'switch'
      | 'with'
      | 'TDZ'
    isStrict: boolean
    upper: Scope | null
    childScopes: Scope[]
    variableScope: Scope
    block: KAST.ESNode
    variables: Variable[]
    set: Map<string, Variable>
    references: Reference[]
    through: Reference[]
    functionExpressionScope: boolean
  }
  interface Variable {
    name: string
    identifiers: KAST.Identifier[]
    references: Reference[]
    defs: Definition[]

    writeable?: boolean | undefined
    eslintExplicitGlobal?: boolean | undefined
    eslintExplicitGlobalComments?: Comment[] | undefined
    eslintImplicitGlobalSetting?: 'readonly' | 'writable' | undefined
  }
  interface Reference {
    identifier: KAST.Identifier
    from: Scope
    resolved: Variable | null
    writeExpr: KAST.ESNode | null
    init: boolean
    isWrite(): boolean
    isRead(): boolean
    isWriteOnly(): boolean
    isReadOnly(): boolean
    isReadWrite(): boolean
  }
  type DefinitionType =
    | { type: 'CatchClause'; node: KAST.CatchClause; parent: null }
    | {
        type: 'ClassName'
        node: KAST.ClassDeclaration | KAST.ClassExpression
        parent: null
      }
    | {
        type: 'FunctionName'
        node: KAST.FunctionDeclaration | KAST.FunctionExpression
        parent: null
      }
    | { type: 'ImplicitGlobalVariable'; node: KAST.Program; parent: null }
    | {
        type: 'ImportBinding'
        node:
          | KAST.ImportSpecifier
          | KAST.ImportDefaultSpecifier
          | KAST.ImportNamespaceSpecifier
        parent: KAST.ImportDeclaration
      }
    | {
        type: 'Parameter'
        node:
          | KAST.FunctionDeclaration
          | KAST.FunctionExpression
          | KAST.ArrowFunctionExpression
        parent: null
      }
    | { type: 'TDZ'; node: any; parent: null }
    | {
        type: 'Variable'
        node: KAST.VariableDeclarator
        parent: KAST.VariableDeclaration
      }
  type Definition = DefinitionType & { name: KAST.Identifier }
}

export class SourceCode /*extends ESLintSourceCode*/ {
  text: string
  ast: AST.Program
  lines: string[]
  hasBOM: boolean
  parserServices: SourceCode.ParserServices
  scopeManager: Scope.ScopeManager
  visitorKeys: SourceCode.VisitorKeys

  static splitLines(text: string): string[]

  getText(
    node?: KNODE.HasLocation,
    beforeCount?: number,
    afterCount?: number
  ): string
  getLines(): string[]
  getAllComments(): KNODE.Comment[]
  getJSDocComment(node: KAST.ESNode): AST.Token | null
  getNodeByRangeIndex(index: number): KAST.ESNode | KAST.JSXNode
  isSpaceBetweenTokens(first: AST.Token, second: AST.Token): boolean
  getLocFromIndex(index: number): KNODE.Position
  getIndexFromLoc(location: KNODE.Position): number

  getTokenByRangeStart(
    offset: number,
    options?: { includeComments?: boolean }
  ): AST.Token | null
  getFirstToken(node: KNODE.HasLocation): AST.Token
  getFirstToken(node: KNODE.HasLocation, options: number): AST.Token
  getFirstToken(
    node: KNODE.HasLocation,
    options: SourceCode.CursorWithSkipOptions
  ): AST.Token | null
  getFirstTokens(
    node: KNODE.HasLocation,
    options?: SourceCode.CursorWithCountOptions
  ): AST.Token[]
  getLastToken(node: KNODE.HasLocation): AST.Token
  getLastToken(node: KNODE.HasLocation, options: number): AST.Token
  getLastToken(
    node: KNODE.HasLocation,
    options: SourceCode.CursorWithSkipOptions
  ): AST.Token | null
  getLastTokens(
    node: KNODE.HasLocation,
    options?: SourceCode.CursorWithCountOptions
  ): AST.Token[]
  getTokenBefore(node: KNODE.HasLocation): AST.Token
  getTokenBefore(node: KNODE.HasLocation, options: number): AST.Token
  getTokenBefore(
    node: KNODE.HasLocation,
    options: { includeComments: boolean }
  ): AST.Token
  getTokenBefore(
    node: KNODE.HasLocation,
    options?: SourceCode.CursorWithSkipOptions
  ): AST.Token | null
  getTokensBefore(
    node: KNODE.HasLocation,
    options?: SourceCode.CursorWithCountOptions
  ): AST.Token[]
  getTokenAfter(node: KNODE.HasLocation): AST.Token
  getTokenAfter(node: KNODE.HasLocation, options: number): AST.Token
  getTokenAfter(
    node: KNODE.HasLocation,
    options: { includeComments: boolean }
  ): AST.Token
  getTokenAfter(
    node: KNODE.HasLocation,
    options: SourceCode.CursorWithSkipOptions
  ): AST.Token | null
  getTokensAfter(
    node: KNODE.HasLocation,
    options?: SourceCode.CursorWithCountOptions
  ): AST.Token[]
  getFirstTokenBetween(
    left: KNODE.HasLocation,
    right: KNODE.HasLocation,
    options?: SourceCode.CursorWithSkipOptions
  ): AST.Token | null
  getFirstTokensBetween(
    left: KNODE.HasLocation,
    right: KNODE.HasLocation,
    options?: SourceCode.CursorWithCountOptions
  ): AST.Token[]
  getLastTokenBetween(
    left: KNODE.HasLocation,
    right: KNODE.HasLocation,
    options?: SourceCode.CursorWithSkipOptions
  ): AST.Token | null
  getLastTokensBetween(
    left: KNODE.HasLocation,
    right: KNODE.HasLocation,
    options?: SourceCode.CursorWithCountOptions
  ): AST.Token[]
  getTokensBetween(
    left: KNODE.HasLocation,
    right: KNODE.HasLocation,
    padding?:
      | number
      | SourceCode.FilterPredicate
      | SourceCode.CursorWithCountOptions
  ): AST.Token[]
  getTokens(
    node: KNODE.HasLocation,
    beforeCount?: number,
    afterCount?: number
  ): AST.Token[]
  getTokens(
    node: KNODE.HasLocation,
    options: SourceCode.FilterPredicate | SourceCode.CursorWithCountOptions
  ): AST.Token[]
  commentsExistBetween(
    left: KNODE.HasLocation,
    right: KNODE.HasLocation
  ): boolean
  getCommentsBefore(nodeOrToken: KNODE.HasLocation): KNODE.Comment[]
  getCommentsAfter(nodeOrToken: KNODE.HasLocation): KNODE.Comment[]
  getCommentsInside(node: KNODE.HasLocation): KNODE.Comment[]
}
export namespace SourceCode {
  interface Config {
    text: string
    ast: AST.Program
    parserServices?: ParserServices
    scopeManager?: Scope.ScopeManager
    visitorKeys?: VisitorKeys
  }

  type ParserServices = parserServices.ParserServices

  interface VisitorKeys {
    [nodeType: string]: string[]
  }

  type FilterPredicate = (tokenOrComment: AST.Token) => boolean

  type CursorWithSkipOptions =
    | number
    | FilterPredicate
    | {
        includeComments?: boolean
        filter?: FilterPredicate
        skip?: number
      }

  type CursorWithCountOptions =
    | number
    | FilterPredicate
    | {
        includeComments?: boolean
        filter?: FilterPredicate
        count?: number
      }
}

export namespace Rule {
  interface RuleModule /*extends ESLintRule.RuleModule*/ {
    meta: RuleMetaData
    create(context: RuleContext): Rule.RuleListener
  }

  type NodeTypes = KAST.ESNode['type']

  type NodeListenerBase = {
    [T in keyof KAST.NodeListenerMap]?: (node: KAST.NodeListenerMap[T]) => void
  }
  interface NodeListener extends NodeListenerBase {
    [key: string]: ((node: KAST.ParamNode) => void) | undefined
  }

  interface RuleListener extends NodeListenerBase {
    onCodePathStart?(codePath: CodePath, node: KAST.ParamNode): void
    onCodePathEnd?(codePath: CodePath, node: KAST.ParamNode): void
    onCodePathSegmentStart?(
      segment: CodePathSegment,
      node: KAST.ParamNode
    ): void
    onCodePathSegmentEnd?(segment: CodePathSegment, node: KAST.ParamNode): void
    onCodePathSegmentLoop?(
      fromSegment: CodePathSegment,
      toSegment: CodePathSegment,
      node: KAST.ParamNode
    ): void
    [key: string]:
      | ((codePath: CodePath, node: KAST.ParamNode) => void)
      | ((segment: CodePathSegment, node: KAST.ParamNode) => void)
      | ((
          fromSegment: CodePathSegment,
          toSegment: CodePathSegment,
          node: KAST.ParamNode
        ) => void)
      | ((node: KAST.ParamNode) => void)
      | undefined
  }
  interface CodePath extends ESLintRule.CodePath {}
  interface CodePathSegment extends ESLintRule.CodePathSegment {}

  interface RuleMetaData extends ESLintRule.RuleMetaData {
    docs: Required<ESLintRule.RuleMetaData>['docs']
  }

  interface RuleContext {
    id: string
    options: ESLintRule.RuleContext['options']
    settings: { [name: string]: any }
    parserPath: string
    parserOptions: any
    parserServices: parserServices.ParserServices

    getAncestors(): KAST.ESNode[]

    getDeclaredVariables(node: KAST.ESNode): Scope.Variable[]
    getFilename(): string
    getScope(): Scope.Scope
    getSourceCode(): SourceCode
    markVariableAsUsed(name: string): boolean
    report(descriptor: ReportDescriptor): void

    // eslint@6 does not have this method.
    getCwd?: () => string
  }

  type ReportDescriptor =
    | ReportDescriptor1
    | ReportDescriptor2
    | ReportDescriptor3
    | ReportDescriptor4

  type SuggestionReportDescriptor =
    | SuggestionReportDescriptor1
    | SuggestionReportDescriptor2

  interface RuleFixer {
    insertTextAfter(nodeOrToken: KNODE.HasLocation, text: string): Fix
    insertTextAfterRange(range: AST.Range, text: string): Fix
    insertTextBefore(nodeOrToken: KNODE.HasLocation, text: string): Fix
    insertTextBeforeRange(range: AST.Range, text: string): Fix
    remove(nodeOrToken: KNODE.HasLocation): Fix
    removeRange(range: AST.Range): Fix
    replaceText(nodeOrToken: KNODE.HasLocation, text: string): Fix
    replaceTextRange(range: AST.Range, text: string): Fix
  }

  interface Fix {
    range: AST.Range
    text: string
  }
}

export class RuleTester extends ESLintRuleTester {}
export class Linter {
  getRules(): Map<string, Rule.RuleModule>
}

export namespace Linter {
  type LintMessage = ESLintLinter.LintMessage
  type LintOptions = ESLintLinter.LintOptions
}

interface ReportDescriptorOptionsBase {
  data?: {
    [key: string]: string | number
  }
  fix?:
    | null
    | ((
        fixer: Rule.RuleFixer
      ) => null | Rule.Fix | IterableIterator<Rule.Fix> | Rule.Fix[])
}

interface SuggestionReportDescriptor1 extends ReportDescriptorOptionsBase {
  desc: string
}

interface SuggestionReportDescriptor2 extends ReportDescriptorOptionsBase {
  messageId: string
}
interface ReportDescriptorOptions extends ReportDescriptorOptionsBase {
  suggest?: Rule.SuggestionReportDescriptor[] | null
}

interface ReportSourceLocation1 {
  start: KNODE.Position
  end: KNODE.Position
  line?: undefined
  column?: undefined
}

interface ReportSourceLocation2 extends KNODE.Position {
  start?: undefined
  end?: undefined
}

type ReportSourceLocation = ReportSourceLocation1 | ReportSourceLocation2

interface ReportDescriptor1 extends ReportDescriptorOptions {
  message: string
  messageId?: string
  node: KNODE.HasLocation
  loc?: ReportSourceLocation
}
interface ReportDescriptor2 extends ReportDescriptorOptions {
  message: string
  messageId?: string
  node?: KNODE.HasLocation
  loc: ReportSourceLocation
}
interface ReportDescriptor3 extends ReportDescriptorOptions {
  message?: string
  messageId: string
  node: KNODE.HasLocation
  loc?: ReportSourceLocation
}
interface ReportDescriptor4 extends ReportDescriptorOptions {
  message?: string
  messageId: string
  node?: KNODE.HasLocation
  loc: ReportSourceLocation
}
