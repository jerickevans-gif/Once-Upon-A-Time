/* Once Upon A Time — Prettier config.
   - Plain Prettier defaults for JS/CSS/HTML/JSON/Markdown
   - @shopify/prettier-plugin-liquid for *.liquid theme files
*/
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: false,
  trailingComma: 'es5',
  arrowParens: 'always',
  bracketSpacing: true,
  bracketSameLine: false,
  endOfLine: 'lf',
  plugins: ['@shopify/prettier-plugin-liquid'],
  overrides: [
    {
      files: '*.liquid',
      options: {
        printWidth: 120,
        singleQuote: true,
        liquidSingleQuote: true,
        embeddedSingleQuote: true,
      },
    },
    {
      files: ['*.html'],
      options: {
        printWidth: 120,
        htmlWhitespaceSensitivity: 'css',
      },
    },
  ],
};
