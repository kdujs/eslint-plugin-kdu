'use strict'

const parser = require('postcss-selector-parser')
const { default: nthCheck } = require('nth-check')
const { getAttribute, isKElement } = require('.')

/**
 * @typedef {object} KElementSelector
 * @property {(element: KElement)=>boolean} test
 */

module.exports = {
  parseSelector
}

/**
 * Parses CSS selectors and returns an object with a function that tests KElement.
 * @param {string} selector CSS selector
 * @param {RuleContext} context - The rule context.
 * @returns {KElementSelector}
 */
function parseSelector(selector, context) {
  let astSelector
  try {
    astSelector = parser().astSync(selector)
  } catch (e) {
    context.report({
      loc: { line: 0, column: 0 },
      message: `Cannot parse selector: ${selector}.`
    })
    return {
      test: () => false
    }
  }

  try {
    const test = selectorsToKElementMatcher(astSelector.nodes)

    return {
      test(element) {
        return test(element, null)
      }
    }
  } catch (e) {
    if (e instanceof SelectorError) {
      context.report({
        loc: { line: 0, column: 0 },
        message: e.message
      })
      return {
        test: () => false
      }
    }
    throw e
  }
}

class SelectorError extends Error {}

/**
 * @typedef {(element: KElement, subject: KElement | null )=>boolean} KElementMatcher
 * @typedef {Exclude<parser.Selector['nodes'][number], {type:'comment'|'root'}>} ChildNode
 */

/**
 * Convert nodes to KElementMatcher
 * @param {parser.Selector[]} selectorNodes
 * @returns {KElementMatcher}
 */
function selectorsToKElementMatcher(selectorNodes) {
  const selectors = selectorNodes.map((n) =>
    selectorToKElementMatcher(cleanSelectorChildren(n))
  )
  return (element, subject) => selectors.some((sel) => sel(element, subject))
}

/**
 * Clean and get the selector child nodes.
 * @param {parser.Selector} selector
 * @returns {ChildNode[]}
 */
function cleanSelectorChildren(selector) {
  /** @type {ChildNode[]} */
  const nodes = []
  /** @type {ChildNode|null} */
  let last = null
  for (const node of selector.nodes) {
    if (node.type === 'root') {
      throw new SelectorError('Unexpected state type=root')
    }
    if (node.type === 'comment') {
      continue
    }
    if (
      (last == null || last.type === 'combinator') &&
      isDescendantCombinator(node)
    ) {
      // Ignore descendant combinator
      continue
    }
    if (isDescendantCombinator(last) && node.type === 'combinator') {
      // Replace combinator
      nodes.pop()
    }
    nodes.push(node)
    last = node
  }
  if (isDescendantCombinator(last)) {
    nodes.pop()
  }
  return nodes

  /**
   * @param {parser.Node|null} node
   * @returns {node is parser.Combinator}
   */
  function isDescendantCombinator(node) {
    return Boolean(node && node.type === 'combinator' && !node.value.trim())
  }
}
/**
 * Convert Selector child nodes to KElementMatcher
 * @param {ChildNode[]} selectorChildren
 * @returns {KElementMatcher}
 */
function selectorToKElementMatcher(selectorChildren) {
  const nodes = [...selectorChildren]
  let node = nodes.shift()
  /**
   * @type {KElementMatcher | null}
   */
  let result = null
  while (node) {
    if (node.type === 'combinator') {
      const combinator = node.value
      node = nodes.shift()
      if (!node) {
        throw new SelectorError(`Expected selector after '${combinator}'.`)
      }
      if (node.type === 'combinator') {
        throw new SelectorError(`Unexpected combinator '${node.value}'.`)
      }
      const right = nodeToKElementMatcher(node)
      result = combination(
        result ||
          // for :has()
          ((element, subject) => element === subject),
        combinator,
        right
      )
    } else {
      const sel = nodeToKElementMatcher(node)
      result = result ? compound(result, sel) : sel
    }
    node = nodes.shift()
  }
  if (!result) {
    throw new SelectorError(`Unexpected empty selector.`)
  }
  return result
}

/**
 * @param {KElementMatcher} left
 * @param {string} combinator
 * @param {KElementMatcher} right
 * @returns {KElementMatcher}
 */
function combination(left, combinator, right) {
  switch (combinator.trim()) {
    case '':
      // descendant
      return (element, subject) => {
        if (right(element, null)) {
          let parent = element.parent
          while (parent.type === 'KElement') {
            if (left(parent, subject)) {
              return true
            }
            parent = parent.parent
          }
        }
        return false
      }
    case '>':
      // child
      return (element, subject) => {
        if (right(element, null)) {
          const parent = element.parent
          if (parent.type === 'KElement') {
            return left(parent, subject)
          }
        }
        return false
      }
    case '+':
      // adjacent
      return (element, subject) => {
        if (right(element, null)) {
          const before = getBeforeElement(element)
          if (before) {
            return left(before, subject)
          }
        }
        return false
      }
    case '~':
      // sibling
      return (element, subject) => {
        if (right(element, null)) {
          for (const before of getBeforeElements(element)) {
            if (left(before, subject)) {
              return true
            }
          }
        }
        return false
      }
    default:
      throw new SelectorError(`Unknown combinator: ${combinator}.`)
  }
}

/**
 * Convert node to KElementMatcher
 * @param {Exclude<parser.Node, {type:'combinator'|'comment'|'root'|'selector'}>} selector
 * @returns {KElementMatcher}
 */
function nodeToKElementMatcher(selector) {
  switch (selector.type) {
    case 'attribute':
      return attributeNodeToKElementMatcher(selector)
    case 'class':
      return classNameNodeToKElementMatcher(selector)
    case 'id':
      return identifierNodeToKElementMatcher(selector)
    case 'tag':
      return tagNodeToKElementMatcher(selector)
    case 'universal':
      return universalNodeToKElementMatcher(selector)
    case 'pseudo':
      return pseudoNodeToKElementMatcher(selector)
    case 'nesting':
      throw new SelectorError('Unsupported nesting selector.')
    case 'string':
      throw new SelectorError(`Unknown selector: ${selector.value}.`)
    default:
      throw new SelectorError(
        `Unknown selector: ${/** @type {any}*/ (selector).value}.`
      )
  }
}

/**
 * Convert Attribute node to KElementMatcher
 * @param {parser.Attribute} selector
 * @returns {KElementMatcher}
 */
function attributeNodeToKElementMatcher(selector) {
  const key = selector.attribute
  if (!selector.operator) {
    return (element) => getAttributeValue(element, key) != null
  }
  const value = selector.value || ''

  switch (selector.operator) {
    case '=':
      return buildKElementMatcher(value, (attr, val) => attr === val)
    case '~=':
      // words
      return buildKElementMatcher(value, (attr, val) =>
        attr.split(/\s+/gu).includes(val)
      )
    case '|=':
      // immediately followed by hyphen
      return buildKElementMatcher(
        value,
        (attr, val) => attr === val || attr.startsWith(`${val}-`)
      )
    case '^=':
      // prefixed
      return buildKElementMatcher(value, (attr, val) => attr.startsWith(val))
    case '$=':
      // suffixed
      return buildKElementMatcher(value, (attr, val) => attr.endsWith(val))
    case '*=':
      // contains
      return buildKElementMatcher(value, (attr, val) => attr.includes(val))
    default:
      throw new SelectorError(`Unsupported operator: ${selector.operator}.`)
  }

  /**
   * @param {string} selectorValue
   * @param {(attrValue:string, selectorValue: string)=>boolean} test
   * @returns {KElementMatcher}
   */
  function buildKElementMatcher(selectorValue, test) {
    const val = selector.insensitive
      ? selectorValue.toLowerCase()
      : selectorValue
    return (element) => {
      const attrValue = getAttributeValue(element, key)
      if (attrValue == null) {
        return false
      }
      return test(
        selector.insensitive ? attrValue.toLowerCase() : attrValue,
        val
      )
    }
  }
}

/**
 * Convert ClassName node to KElementMatcher
 * @param {parser.ClassName} selector
 * @returns {KElementMatcher}
 */
function classNameNodeToKElementMatcher(selector) {
  const className = selector.value
  return (element) => {
    const attrValue = getAttributeValue(element, 'class')
    if (attrValue == null) {
      return false
    }
    return attrValue.split(/\s+/gu).includes(className)
  }
}

/**
 * Convert Identifier node to KElementMatcher
 * @param {parser.Identifier} selector
 * @returns {KElementMatcher}
 */
function identifierNodeToKElementMatcher(selector) {
  const id = selector.value
  return (element) => {
    const attrValue = getAttributeValue(element, 'id')
    if (attrValue == null) {
      return false
    }
    return attrValue === id
  }
}

/**
 * Convert Tag node to KElementMatcher
 * @param {parser.Tag} selector
 * @returns {KElementMatcher}
 */
function tagNodeToKElementMatcher(selector) {
  const name = selector.value
  return (element) => element.rawName === name
}

/**
 * Convert Universal node to KElementMatcher
 * @param {parser.Universal} _selector
 * @returns {KElementMatcher}
 */
function universalNodeToKElementMatcher(_selector) {
  return () => true
}
/**
 * Convert Pseudo node to KElementMatcher
 * @param {parser.Pseudo} selector
 * @returns {KElementMatcher}
 */
function pseudoNodeToKElementMatcher(selector) {
  const pseudo = selector.value
  switch (pseudo) {
    case ':not': {
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:not
      const selectors = selectorsToKElementMatcher(selector.nodes)
      return (element, subject) => {
        return !selectors(element, subject)
      }
    }
    case ':is':
    case ':where':
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:is
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:where
      return selectorsToKElementMatcher(selector.nodes)
    case ':has':
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:has
      return pseudoHasSelectorsToKElementMatcher(selector.nodes)
    case ':empty':
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:empty
      return (element) =>
        element.children.every(
          (child) => child.type === 'KText' && !child.value.trim()
        )
    case ':nth-child': {
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-child
      const nth = parseNth(selector)
      return buildPseudoNthKElementMatcher(nth)
    }
    case ':nth-last-child': {
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-last-child
      const nth = parseNth(selector)
      return buildPseudoNthKElementMatcher((index, length) =>
        nth(length - index - 1)
      )
    }
    case ':first-child':
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:first-child
      return buildPseudoNthKElementMatcher((index) => index === 0)
    case ':last-child':
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:last-child
      return buildPseudoNthKElementMatcher(
        (index, length) => index === length - 1
      )
    case ':only-child':
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:only-child
      return buildPseudoNthKElementMatcher(
        (index, length) => index === 0 && length === 1
      )
    case ':nth-of-type': {
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-of-type
      const nth = parseNth(selector)
      return buildPseudoNthOfTypeKElementMatcher(nth)
    }
    case ':nth-last-of-type': {
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-last-of-type
      const nth = parseNth(selector)
      return buildPseudoNthOfTypeKElementMatcher((index, length) =>
        nth(length - index - 1)
      )
    }
    case ':first-of-type':
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:first-of-type
      return buildPseudoNthOfTypeKElementMatcher((index) => index === 0)
    case ':last-of-type':
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:last-of-type
      return buildPseudoNthOfTypeKElementMatcher(
        (index, length) => index === length - 1
      )
    case ':only-of-type':
      // https://developer.mozilla.org/en-US/docs/Web/CSS/:only-of-type
      return buildPseudoNthOfTypeKElementMatcher(
        (index, length) => index === 0 && length === 1
      )
    default:
      throw new SelectorError(`Unsupported pseudo selector: ${pseudo}.`)
  }
}

/**
 * Convert :has() selector nodes to KElementMatcher
 * @param {parser.Selector[]} selectorNodes
 * @returns {KElementMatcher}
 */
function pseudoHasSelectorsToKElementMatcher(selectorNodes) {
  const selectors = selectorNodes.map((n) =>
    pseudoHasSelectorToKElementMatcher(n)
  )
  return (element, subject) => selectors.some((sel) => sel(element, subject))
}
/**
 * Convert :has() selector node to KElementMatcher
 * @param {parser.Selector} selector
 * @returns {KElementMatcher}
 */
function pseudoHasSelectorToKElementMatcher(selector) {
  const nodes = cleanSelectorChildren(selector)
  const selectors = selectorToKElementMatcher(nodes)
  const firstNode = nodes[0]
  if (
    firstNode.type === 'combinator' &&
    (firstNode.value === '+' || firstNode.value === '~')
  ) {
    // adjacent or sibling
    return buildKElementMatcher(selectors, (element) =>
      getAfterElements(element)
    )
  }
  // descendant or child
  return buildKElementMatcher(selectors, (element) =>
    element.children.filter(isKElement)
  )

  /**
   * @param {KElementMatcher} selectors
   * @param {(element: KElement) => KElement[]} getStartElements
   * @returns {KElementMatcher}
   */
  function buildKElementMatcher(selectors, getStartElements) {
    return (element) => {
      const elements = [...getStartElements(element)]
      /** @type {KElement|undefined} */
      let curr
      while ((curr = elements.shift())) {
        const el = curr
        if (selectors(el, element)) {
          return true
        }
        elements.push(...el.children.filter(isKElement))
      }
      return false
    }
  }
}

/**
 * Parse <nth>
 * @param {parser.Pseudo} pseudoNode
 * @returns {(index: number)=>boolean}
 */
function parseNth(pseudoNode) {
  const argumentsText = pseudoNode
    .toString()
    .slice(pseudoNode.value.length)
    .toLowerCase()
  const openParenIndex = argumentsText.indexOf('(')
  const closeParenIndex = argumentsText.lastIndexOf(')')
  if (openParenIndex < 0 || closeParenIndex < 0) {
    throw new SelectorError(
      `Cannot parse An+B micro syntax (:nth-xxx() argument): ${argumentsText}.`
    )
  }

  const argument = argumentsText
    .slice(openParenIndex + 1, closeParenIndex)
    .trim()
  try {
    return nthCheck(argument)
  } catch (e) {
    throw new SelectorError(
      `Cannot parse An+B micro syntax (:nth-xxx() argument): '${argument}'.`
    )
  }
}

/**
 * Build KElementMatcher for :nth-xxx()
 * @param {(index: number, length: number)=>boolean} testIndex
 * @returns {KElementMatcher}
 */
function buildPseudoNthKElementMatcher(testIndex) {
  return (element) => {
    const elements = element.parent.children.filter(isKElement)
    return testIndex(elements.indexOf(element), elements.length)
  }
}

/**
 * Build KElementMatcher for :nth-xxx-of-type()
 * @param {(index: number, length: number)=>boolean} testIndex
 * @returns {KElementMatcher}
 */
function buildPseudoNthOfTypeKElementMatcher(testIndex) {
  return (element) => {
    const elements = element.parent.children
      .filter(isKElement)
      .filter((e) => e.rawName === element.rawName)
    return testIndex(elements.indexOf(element), elements.length)
  }
}

/**
 * @param {KElement} element
 */
function getBeforeElement(element) {
  return getBeforeElements(element).pop() || null
}
/**
 * @param {KElement} element
 */
function getBeforeElements(element) {
  const parent = element.parent
  const index = parent.children.indexOf(element)
  return parent.children.slice(0, index).filter(isKElement)
}

/**
 * @param {KElement} element
 */
function getAfterElements(element) {
  const parent = element.parent
  const index = parent.children.indexOf(element)
  return parent.children.slice(index + 1).filter(isKElement)
}

/**
 * @param {KElementMatcher} a
 * @param {KElementMatcher} b
 * @returns {KElementMatcher}
 */
function compound(a, b) {
  return (element, subject) => a(element, subject) && b(element, subject)
}

/**
 * Get attribute value from given element.
 * @param {KElement} element The element node.
 * @param {string} attribute The attribute name.
 */
function getAttributeValue(element, attribute) {
  const attr = getAttribute(element, attribute)
  if (attr) {
    return (attr.value && attr.value.value) || ''
  }
  return null
}
