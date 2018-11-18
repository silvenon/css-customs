# css-customs-loader

Exposes CSS custom properties, custom media queries and custom selectors (I call them "customs") to JavaScript.

Recommended with [postcss-preset-env][], instructions below.

## Usage

```
yarn add css-customs-loader
```

### Basic

Make sure to include it **before** css-loader:

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
        ],
      },
    ],
  },
}
```

Write CSS containing customs:

```css
/* style.css */
:root {
  --primary-color: lightblue;
}

@custom-media --narrow-window (max-width: 30em);

@custom-selector :--title h1;
```

Import them into JavaScript:

```js
// index.js
import { customProperties, customMedia, customSelectors } from './style.css'

console.log(customProperties['--primary-color']) // 'lightblue'
console.log(customMedia['--narrow-window']) // '(max-width: 30em)'
console.log(customSelectors['--title']) // 'h1'
```

### With CSS Modules

When using [CSS Modules][css-modules], CSS customs will be exported along with class names in the same object.

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
          'css-loader?modules',
        ],
      },
    ],
  },
}
```

```css
/* style.css */
:root {
  --primary-color: lightblue;
}

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

### With CSS Modules and postcss-preset-env

```
yarn add postcss-loader postcss-preset-env
```

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
          'css-loader?modules&importLoaders=1',
          'postcss-loader',
        ]
      },
    ],
  },
}
```

Configure postcss-preset-env to use customs when compiling CSS files:

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-preset-env': {
      // contents of this file will be available in every CSS file
      importFrom: 'customs.css',
      // enable all features, the default stage 2
      // doesn't include features like custom media queries
      stage: 0,
      // don't strip off experimental features like custom media queries,
      // otherwise css-customs-loader won't be able to expose them
      preserve: true,
    },
  },
}
```

```css
/* customs.css */
@custom-media --narrow-window (min-width: 30em);

:root {
  --image-width: 300px;
  --image-width-narrow: 200px;
}
```

Now this custom media query and custom properties will be available in all CSS files:

```css
/* style.css */
.image {
  width: var(--image-width);
}

@media (--narrow-window) {
  .image {
    width: var(--image-width-narrow);
  }
}
```

```jsx
// index.js
import React from 'react'
import { customMedia, customProperties } from './customs.css'
import styles from './style.css'

const Image = () => (
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
```

**Always import your customs.** Even if you're not using the exported values in JavaScript, import `customs.css` at least once in your app in order to ensure that its contents end up in your CSS. It's true that postcss-preset-env provides fallbacks for browsers that don't support custom properties, but those that do will try to use them and fail if they don't exist.

Despite its name, `importFrom` doesn't actually import that file, postcss-preset-env only uses it to provide fallbacks. This is why you need to import it as a module yourself.

## Caveats

Exposing customs and class names in the same object is not ideal because if we were to use the class name `.customProperties`, it would get overwritten with the `customProperties` object and we would be unable to access it.

[postcss-preset-env]: https://preset-env.cssdb.org/
[css-modules]: https://github.com/webpack-contrib/css-loader#modules
