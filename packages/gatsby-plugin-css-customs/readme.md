# gatsby-plugin-css-customs

Implements [css-customs-loader][] in Gatsby.

## Configuration

Add it to `gatsby-config.js` after gatsby-plugin-postcss and any other Gatsby plugins that modify CSS webpack rules:

```
yarn add gatsby-plugin-postcss gatsby-plugin-css-customs
```

```js
module.exports = {
  plugins: [
    'gatsby-plugin-postcss',
    // ...other CSS plugins
    {
      resolve: 'gatsby-plugin-css-customs',
      // defaults
      options: {
        cssModules: false,
      },
    },
  ],
}
```

gatsby-plugin-css-customs detects [any valid PostCSS configuration][postcss-config] (including options passed to gatsby-plugin-postcss!), so let's create one. `importFrom` will point to a `global.css` file containing our customs and, for the sake of this example, we'll enable all features related to CSS customs:

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-preset-env': {
      importFrom: 'src/global.css',
      features: {
        'custom-properties': true, // already enabled by default
        'custom-media-queries': true,
        'custom-selectors': true,
      },
    },
  },
}
```

### Options

#### `cssModules`

The plugin adds css-customs-loader only to the CSS webpack rule (`.css`). If `cssModules` is `true` the loader is applied to the rule for CSS Modules (`.module.css`) as well.

## Usage

See usage instructions in the [main readme][basic-usage].

[css-customs-loader]: https://github.com/silvenon/css-customs/blob/master/packages/css-customs-loader
[postcss-config]: https://github.com/michael-ciniawsky/postcss-load-config
[basic-usage]: https://github.com/silvenon/css-customs/blob/master/readme.md#basic-usage
