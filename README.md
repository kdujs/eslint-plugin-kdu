# eslint-plugin-kdu

ESLint plugin for Kdu.js projects

## Usage

1. `npm install --save-dev eslint-plugin-kdu`
2. create a file named `.eslintrc` in your project:

```js
{
  extends: [ /* your usual extends */ ],
  plugins: ["kdu"],
  rules: {
    'kdu/jsx-uses-vars': 2,
  },
}
```
3. OPTIONAL: install [eslint-config-kdu](https://github.com/kdujs/eslint-config-kdu): `npm install --save-dev eslint-config-kdu`
4. OPTIONAL: then use the recommended configurations in your `.eslintrc`:

```js
{
  extends: ["kdu", /* your other extends */],
  plugins: ["kdu"],
  rules: {
    /* your overrides -- kdu/jsx-uses-vars is included in eslint-config-kdu */
  },
}
```

## License

[MIT](http://opensource.org/licenses/MIT)
