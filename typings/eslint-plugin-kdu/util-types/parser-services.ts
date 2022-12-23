import * as KNODE from './node'
import * as KAST from './ast'
import * as eslint from 'eslint'

type TemplateListenerBase = {
  [T in keyof KAST.KNodeListenerMap]?: (node: KAST.KNodeListenerMap[T]) => void
}
export interface TemplateListener
  extends TemplateListenerBase,
    eslint.Rule.NodeListener {
  [key: string]: ((node: KAST.ParamNode) => void) | undefined
}

export interface ParserServices {
  getTemplateBodyTokenStore: () => ParserServices.TokenStore
  defineTemplateBodyVisitor?: (
    templateBodyVisitor: TemplateListener,
    scriptVisitor?: eslint.Rule.RuleListener,
    options?: {
      templateBodyTriggerSelector: 'Program' | 'Program:exit'
    }
  ) => eslint.Rule.RuleListener
  defineDocumentVisitor?: (
    documentVisitor: TemplateListener,
    options?: {
      triggerSelector: 'Program' | 'Program:exit'
    }
  ) => eslint.Rule.RuleListener
  getDocumentFragment?: () => KAST.KDocumentFragment | null
}
export namespace ParserServices {
  export interface TokenStore {
    getTokenByRangeStart(
      offset: number,
      options?: { includeComments: boolean }
    ): KNODE.Token | null
    getFirstToken(node: KNODE.HasLocation): KNODE.Token
    getFirstToken(node: KNODE.HasLocation, options: number): KNODE.Token
    getFirstToken(
      node: KNODE.HasLocation,
      options: eslint.SourceCode.CursorWithSkipOptions
    ): KNODE.Token | null
    getLastToken(node: KNODE.HasLocation): KNODE.Token
    getLastToken(node: KNODE.HasLocation, options: number): KNODE.Token
    getLastToken(
      node: KNODE.HasLocation,
      options: eslint.SourceCode.CursorWithSkipOptions
    ): KNODE.Token | null
    getTokenBefore(node: KNODE.HasLocation): KNODE.Token
    getTokenBefore(node: KNODE.HasLocation, options: number): KNODE.Token
    getTokenBefore(
      node: KNODE.HasLocation,
      options: { includeComments: boolean }
    ): KNODE.Token
    getTokenBefore(
      node: KNODE.HasLocation,
      options: eslint.SourceCode.CursorWithSkipOptions
    ): KNODE.Token | null
    getTokenAfter(node: KNODE.HasLocation): KNODE.Token
    getTokenAfter(node: KNODE.HasLocation, options: number): KNODE.Token
    getTokenAfter(
      node: KNODE.HasLocation,
      options: { includeComments: boolean }
    ): KNODE.Token
    getTokenAfter(
      node: KNODE.HasLocation,
      options: eslint.SourceCode.CursorWithSkipOptions
    ): KNODE.Token | null
    getFirstTokenBetween(
      left: KNODE.HasLocation,
      right: KNODE.HasLocation,
      options?: eslint.SourceCode.CursorWithSkipOptions
    ): KNODE.Token | null
    getLastTokenBetween(
      left: KNODE.HasLocation,
      right: KNODE.HasLocation,
      options?: eslint.SourceCode.CursorWithSkipOptions
    ): KNODE.Token | null
    getTokenOrCommentBefore(
      node: KNODE.HasLocation,
      skip?: number
    ): KNODE.Token | null
    getTokenOrCommentAfter(
      node: KNODE.HasLocation,
      skip?: number
    ): KNODE.Token | null
    getFirstTokens(
      node: KNODE.HasLocation,
      options?: eslint.SourceCode.CursorWithCountOptions
    ): KNODE.Token[]
    getLastTokens(
      node: KNODE.HasLocation,
      options?: eslint.SourceCode.CursorWithCountOptions
    ): KNODE.Token[]
    getTokensBefore(
      node: KNODE.HasLocation,
      options?: eslint.SourceCode.CursorWithCountOptions
    ): KNODE.Token[]
    getTokensAfter(
      node: KNODE.HasLocation,
      options?: eslint.SourceCode.CursorWithCountOptions
    ): KNODE.Token[]
    getFirstTokensBetween(
      left: KNODE.HasLocation,
      right: KNODE.HasLocation,
      options?: eslint.SourceCode.CursorWithCountOptions
    ): KNODE.Token[]
    getLastTokensBetween(
      left: KNODE.HasLocation,
      right: KNODE.HasLocation,
      options?: eslint.SourceCode.CursorWithCountOptions
    ): KNODE.Token[]
    getTokens(
      node: KNODE.HasLocation,
      beforeCount?: eslint.SourceCode.CursorWithCountOptions,
      afterCount?: number
    ): KNODE.Token[]
    getTokensBetween(
      left: KNODE.HasLocation,
      right: KNODE.HasLocation,
      padding?: eslint.SourceCode.CursorWithCountOptions
    ): KNODE.Token[]
    commentsExistBetween(
      left: KNODE.HasLocation,
      right: KNODE.HasLocation
    ): boolean
    getCommentsBefore(nodeOrToken: KNODE.HasLocation): KNODE.Token[]
    getCommentsAfter(nodeOrToken: KNODE.HasLocation): KNODE.Token[]
    getCommentsInside(node: KNODE.HasLocation): KNODE.Token[]
  }
}
