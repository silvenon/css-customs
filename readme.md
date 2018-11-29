# css-customs-loader [![Travis (.org) branch](https://img.shields.io/travis/silvenon/css-customs-loader.svg?style=flat-square)](https://travis-ci.org/silvenon/css-customs-loader)


Exposes CSS custom properties, custom media queries and custom selectors to JavaScript.

```css
/* global.css */
:root {
  --primary-color: lightblue;
}

@custom-media --narrow-window (max-width: 30em);

@custom-selector :--title h1;
```

```js
// index.js
import { customProperties, customMedia, customSelectors } from './global.css'

console.log(customProperties['--primary-color']) // 'lightblue'
console.log(customMedia['--narrow-window']) // '(max-width: 30em)'
console.log(customSelectors[':--title']) // 'h1'
```

I call these exported values "customs" for short.

## How it works

css-customs-loader is meant to be combined with [postcss-preset-env][], which is why it depends on it, as well as on [postcss-loader][]. The idea for this loader came from two options added to postcss-preset-env: [`importFrom`][importFrom] and [`exportTo`][exportTo]. The workflow I recommend is having one file containing all customs that you want to be available globally, then we can point `importFrom` to that file and import customs into JavaScript from it.

Note that declaring custom properties on `:root` is by definition available globally, but [current browser support][caniuse-custom-properties] is not ideal, and browser support for custom media queries and custom selectors is non-existent, because they are still experimental. postcss-preset-env provides substitution and fallbacks for these features, but since it works on a per-file basis and doesn't know about customs defined in another file. This is what `importFrom` is for.

The `exportTo` option enables us to export customs to a JavaScript file, so this is what css-customs-loader uses under the hood. Using it yourself directly is tricky because the file would be generated _after_ webpack runs, which would cause a compilation error because webpack would try to import a file which doesn't exist yet. This loader reduces that friction and avoids excessive compilations.

## Configuration

```
yarn add css-customs-loader postcss-loader postcss-preset-env
```

You need to add css-customs-loader **before** css-loader:

```js
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-customs-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
}
```

css-customs-loader detects [any valid PostCSS configuration][postcss-config] (including options passed to postcss-loader!) so let's create a configuration file which. We'll have a `global.css` file containing our customs and, for the sake of this example, we'll enable all features relevant to this loader:

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-preset-env': {
      importFrom: 'src/global.css',
      features: {
        'custom-properties': true, // by default only this is enabled
        'custom-media-queries': true,
        'custom-selectors': true,
      },
    },
  },
}
```

## Basic usage

Let's create a file called `global.css` containing our customs:

```css
/* global.css */
:root {
  --primary-color: lightblue;
}

@custom-media --narrow-window (max-width: 30em);

@custom-selector :--title h1;
```

We can import them into JavaScript like this:

```js
// index.js
import { customProperties, customMedia, customSelectors } from './global.css'

console.log(customProperties['--primary-color']) // 'lightblue'
console.log(customMedia['--narrow-window']) // '(max-width: 30em)'
console.log(customSelectors[':--title']) // 'h1'
```

### Import all files specified in `importFrom` into JavaScript

Even if you're not using the exported values in JavaScript, remember to import all files specified in `importFrom` at least once in your application code in order to ensure that their contents end up in the bundle. While it's true that postcss-preset-env provides fallbacks for browsers that don't support custom properties, browsers that **do** will try to use them and fail if they don't exist.

```css
.link {
  color: lightblue;
  color: var(--primary-color);
  /** if --primary-color isn't defined in your CSS,
    * browsers that support custom properties
    * won't fall back to lightblue
    */
}
```

Despite its name, `importFrom` doesn't actually import that file into webpack, postcss-preset-env only uses it to provide fallbacks. This is why you need to import it as a module yourself.

## Usage with CSS Modules

If you're using [CSS Modules][css-modules], customs will be exported along with the class names, in the same object:

```css
/* style.css */
.link {
  color: var(--primary-color);
}
```

```js
// index.js
import styles from './style.css'

console.log(styles.customProperties['--primary-color']) // 'lightblue'
console.log(styles.link) // '_23_aKvs-b8bW2Vg3fwHozO'
```

**Caveat**. Exposing customs and class names in the same object means that we can't use a class name like `.customProperties` because it would get silently overwritten with the `customProperties` object, making it inaccessible.

## Advanced example

If you didn't get enough, here's a more complex example of how you might use css-customs-loader to make your codebase more DRY without compromising CSS authoring experience:

```css
/* global.css */
:root {
  --image-width: 300px;
  --image-width-narrow: 200px;
}

@custom-media --narrow-window (max-width: 30em);
```

```css
/* style.css */
.image {
  width: var(--image-width);
}

@media (--narrow-window) {
  width: var(--image-width-narrow);
}
```

```jsx
// kitten-image.js
import React from 'react'
import { customMedia, customProperties } from './global.css'
import styles from './style.css'

const KittenImage = () => (
  <img
    className={styles.image}
    alt="a kitten"
    src="kitten-200.jpg"
    srcSet="kitten-200.jpg 200w,
            kitten-300.jpg 300w"
    sizes={`
      ${customMedia['--narrow-window']} ${customProperties['--image-width-narrow']},
      ${customProperties['--image-width']}
    `}
  />
)

export default KittenImage
```

[postcss-preset-env]: https://preset-env.cssdb.org/
[postcss-loader]: https://github.com/postcss/postcss-loader
[importFrom]: https://github.com/csstools/postcss-preset-env#importfrom
[exportTo]: https://github.com/csstools/postcss-preset-env#exportTo
[caniuse-custom-properties]: https://caniuse.com/#feat=css-variables
[postcss-config]: https://github.com/michael-ciniawsky/postcss-load-config
[css-modules]: https://github.com/webpack-contrib/css-loader#modules
