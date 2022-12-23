# eslint-plugin-kdu

> Official ESLint plugin for Kdu.js

## Documentation

See [the official website](https://kdujs-eslint.web.app).

## Versioning Policy

This plugin is following [Semantic Versioning](https://semver.org/) and [ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

### Working with Rules

Before you start writing a new rule, please read [the official ESLint guide](https://eslint.org/docs/developer-guide/working-with-rules).

Next, in order to get an idea how does the AST of the code that you want to check looks like, use the [astexplorer.net].
The [astexplorer.net] is a great tool to inspect ASTs, also Kdu templates are supported.

After opening [astexplorer.net], select `Kdu` as the syntax and `kdu-eslint-parser` as the parser.

[astexplorer.net]: https://astexplorer.net/

Since single file components in Kdu are not plain JavaScript, the default parser couldn't be used, so a new one was introduced. `kdu-eslint-parser` generates enhanced AST with nodes that represent specific parts of the template syntax, as well as what's inside the `<script>` tag.

The `kdu-eslint-parser` provides a few useful parser services that help traverse the produced AST and access tokens of the template:
- `context.parserServices.defineTemplateBodyVisitor(visitor, scriptVisitor)`
- `context.parserServices.getTemplateBodyTokenStore()`

Check out [an example rule](https://github.com/kdujs/eslint-plugin-kdu/blob/main/lib/rules/mustache-interpolation-spacing.js) to get a better understanding of how these work.

Please be aware that regarding what kind of code examples you'll write in tests, you'll have to accordingly set up the parser in `RuleTester` (you can do it on a per test case basis).

If you'll stuck, remember there are plenty of rules you can learn from already. If you can't find the right solution, don't hesitate to reach out in [issues](https://github.com/kdujs/eslint-plugin-kdu/issues) – we're happy to help!

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
