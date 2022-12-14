# eslint-plugin-kdu

> Official ESLint plugin for Kdu.js

## Requirements

- [ESLint](http://eslint.org/) `>=3.18.0`.
  - `>=4.7.0` to use `eslint --fix`.
  - `>=4.14.0` to use with `babel-eslint`.
- Node.js `>=4.0.0`

## Installation

```bash
npm install --save-dev eslint eslint-plugin-kdu
```

## Usage

Create `.eslintrc.*` file to configure rules. See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring).

Example **.eslintrc.js**:

```js
module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:kdu/essential'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'kdu/no-unused-vars': 'error'
  }
}
```

### Attention

All component-related rules are being applied to code that passes any of the following checks:

* `Kdu.component()` expression
* `Kdu.extend()` expression
* `Kdu.mixin()` expression
* `export default {}` in `.kdu` or `.jsx` file

If you however want to take advantage of our rules in any of your custom objects that are Kdu components, you might need to use special comment `// @kdujs/component` that marks object in the next line as a Kdu component in any file, e.g.:

```js
// @kdujs/component
const CustomComponent = {
  name: 'custom-component',
  template: '<div></div>'
}
```
```js
Kdu.component('AsyncComponent', (resolve, reject) => {
  setTimeout(() => {
    // @kdujs/component
    resolve({
      name: 'async-component',
      template: '<div></div>'
    })
  }, 500)
})
```

### `eslint-disable` functionality in `<template>`

You can use `<!-- eslint-disable -->`-like HTML comments in `<template>` of `.kdu` files. For example:

```html
<template>
  <!-- eslint-disable-next-line kdu/max-attributes-per-line -->
  <div a="1" b="2" c="3" d="4">
  </div>
</template>
```

If you want to disallow `eslint-disable` functionality, please disable `kdu/comment-directive` rule.

## :gear: Configs

This plugin provides four predefined configs:
- `plugin:kdu/base` - Settings and rules to enable correct ESLint parsing
- `plugin:kdu/essential` - Above, plus rules to prevent errors or unintended behavior
- `plugin:kdu/strongly-recommended` - Above, plus rules to considerably improve code readability and/or dev experience
- `plugin:kdu/recommended` - Above, plus rules to enforce subjective community defaults to ensure consistency

## :bulb: Rules

Rules are grouped by priority to help you understand their purpose. The `--fix` option on the command line automatically fixes problems reported by rules which have a wrench :wrench: below.

<!--RULES_TABLE_START-->

### Base Rules (Enabling Correct ESLint Parsing)

Enforce all the rules in this category, as well as all higher priority rules, with:

```json
{
  "extends": "plugin:kdu/base"
}
```

|    | Rule ID | Description |
|:---|:--------|:------------|
|  | kdu/comment-directive | support comment-directives in `<template>` |
|  | kdu/jsx-uses-vars | prevent variables used in JSX to be marked as unused |

### Priority A: Essential (Error Prevention)

Enforce all the rules in this category, as well as all higher priority rules, with:

```json
{
  "extends": "plugin:kdu/essential"
}
```

|    | Rule ID | Description |
|:---|:--------|:------------|
|  | kdu/no-async-in-computed-properties | disallow asynchronous actions in computed properties |
|  | kdu/no-dupe-keys | disallow duplication of field names |
|  | kdu/no-duplicate-attributes | disallow duplication of attributes |
|  | kdu/no-parsing-error | disallow parsing errors in `<template>` |
|  | kdu/no-reserved-keys | disallow overwriting reserved keys |
| :wrench: | kdu/no-shared-component-data | enforce component's data property to be a function |
|  | kdu/no-side-effects-in-computed-properties | disallow side effects in computed properties |
|  | kdu/no-template-key | disallow `key` attribute on `<template>` |
|  | kdu/no-textarea-mustache | disallow mustaches in `<textarea>` |
|  | kdu/no-unused-vars | disallow unused variable definitions of k-for directives or scope attributes |
|  | kdu/require-component-is | require `k-bind:is` of `<component>` elements |
|  | kdu/require-render-return | enforce render function to always return value |
|  | kdu/require-k-for-key | require `k-bind:key` with `k-for` directives |
|  | kdu/require-valid-default-prop | enforce props default values to be valid |
|  | kdu/return-in-computed-property | enforce that a return statement is present in computed property |
|  | kdu/valid-template-root | enforce valid template root |
|  | kdu/valid-k-bind | enforce valid `k-bind` directives |
|  | kdu/valid-k-cloak | enforce valid `k-cloak` directives |
|  | kdu/valid-k-else-if | enforce valid `k-else-if` directives |
|  | kdu/valid-k-else | enforce valid `k-else` directives |
|  | kdu/valid-k-for | enforce valid `k-for` directives |
|  | kdu/valid-k-html | enforce valid `k-html` directives |
|  | kdu/valid-k-if | enforce valid `k-if` directives |
|  | kdu/valid-k-model | enforce valid `k-model` directives |
|  | kdu/valid-k-on | enforce valid `k-on` directives |
|  | kdu/valid-k-once | enforce valid `k-once` directives |
|  | kdu/valid-k-pre | enforce valid `k-pre` directives |
|  | kdu/valid-k-show | enforce valid `k-show` directives |
|  | kdu/valid-k-text | enforce valid `k-text` directives |

### Priority B: Strongly Recommended (Improving Readability)

Enforce all the rules in this category, as well as all higher priority rules, with:

```json
{
  "extends": "plugin:kdu/strongly-recommended"
}
```

|    | Rule ID | Description |
|:---|:--------|:------------|
| :wrench: | kdu/attribute-hyphenation | enforce attribute naming style in template |
| :wrench: | kdu/html-end-tags | enforce end tag style |
| :wrench: | kdu/html-indent | enforce consistent indentation in `<template>` |
| :wrench: | kdu/html-self-closing | enforce self-closing style |
| :wrench: | kdu/max-attributes-per-line | enforce the maximum number of attributes per line |
| :wrench: | kdu/mustache-interpolation-spacing | enforce unified spacing in mustache interpolations |
| :wrench: | kdu/name-property-casing | enforce specific casing for the name property in Kdu components |
| :wrench: | kdu/no-multi-spaces | disallow multiple spaces |
|  | kdu/require-default-prop | require default value for props |
|  | kdu/require-prop-types | require type definitions in props |
| :wrench: | kdu/k-bind-style | enforce `k-bind` directive style |
| :wrench: | kdu/k-on-style | enforce `k-on` directive style |

### Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)

Enforce all the rules in this category, as well as all higher priority rules, with:

```json
{
  "extends": "plugin:kdu/recommended"
}
```

|    | Rule ID | Description |
|:---|:--------|:------------|
| :wrench: | kdu/attributes-order | enforce order of attributes |
| :wrench: | kdu/html-quotes | enforce quotes style of HTML attributes |
|  | kdu/no-confusing-k-for-k-if | disallow confusing `k-for` and `k-if` on the same element |
| :wrench: | kdu/order-in-components | enforce order of properties in components |
|  | kdu/this-in-template | enforce usage of `this` in template |

### Uncategorized

|    | Rule ID | Description |
|:---|:--------|:------------|
| :wrench: | kdu/html-closing-bracket-newline | require or disallow a line break before tag's closing brackets |
| :wrench: | kdu/html-closing-bracket-spacing | require or disallow a space before tag's closing brackets |
| :wrench: | kdu/prop-name-casing | enforce specific casing for the Prop name in Kdu components |
| :wrench: | kdu/script-indent | enforce consistent indentation in `<script>` |

<!--RULES_TABLE_END-->

## :couple: FAQ

### What is the "Use the latest kdu-eslint-parser" error?

The most rules of `eslint-plugin-kdu` require `kdu-eslint-parser` to check `<template>` ASTs.

Make sure you have one of the following settings in your **.eslintrc**:

- `"extends": ["plugin:kdu/recommended"]`
- `"extends": ["plugin:kdu/base"]`

If you already use other parser (e.g. `"parser": "babel-eslint"`), please move it into `parserOptions`, so it doesn't collide with the `kdu-eslint-parser` used by this plugin's configuration:

```diff
- "parser": "babel-eslint",
  "parserOptions": {
+     "parser": "babel-eslint",
      "ecmaVersion": 2017,
      "sourceType": "module"
  }
```

The `kdu-eslint-parser` uses the parser which is set by `parserOptions.parser` to parse scripts.

### Why doesn't it work on .kdu file?

1. Make sure you don't have `eslint-plugin-html` in your config. The `eslint-plugin-html` extracts the content from `<script>` tags, but `eslint-kdu-plugin` requires `<script>` tags and `<template>` tags in order to distinguish template and script in single file components.

  ```diff
    "plugins": [
      "kdu",
  -   "html"
    ]
  ```

2. Make sure your tool is set to lint `.kdu` files.
  - CLI targets only `.js` files by default. You have to specify additional extensions by `--ext` option or glob patterns. E.g. `eslint "src/**/*.{js,kdu}"` or `eslint src --ext .kdu`.
  - VSCode targets only JavaScript or HTML files by default. You have to add `{"autoFix": true, "language": "kdu"}` into `eslint.validate` entry.

## :anchor: Semantic Versioning Policy

This plugin follows [semantic versioning](http://semver.org/) and [ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

## :beers: Contribution guide

In order to add a new rule, you should:
- Create issue on GH with description of proposed rule
- Generate a new rule using the [official yeoman generator](https://github.com/eslint/generator-eslint)
- Run `npm start`
- Write test scenarios & implement logic
- Describe the rule in the generated `docs` file
- Make sure all tests are passing
- Run `npm run update` in order to update readme and recommended configuration
- Create PR and link created issue in description

We're more than happy to see potential contributions, so don't hesitate. If you have any suggestions, ideas or problems feel free to add new [issue](https://github.com/kdujs/eslint-plugin-kdu/issues), but first please make sure your question does not repeat previous ones.

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
