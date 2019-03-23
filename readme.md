# CSS Customs ![monorepo](https://img.shields.io/badge/mono-repo-ff69b4.svg) [![Travis (.org) branch](https://img.shields.io/travis/silvenon/css-customs.svg)](https://travis-ci.org/silvenon/css-customs)

This repository contains two packages:

  - [css-customs-loader](/packages/css-customs-loader)
  - [gatsby-plugin-css-customs](/packages/gatsby-plugin-css-customs)

The Gatsby plugin only implements css-customs-loader, so this readme is about css-customs-loader.

---

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

  - [css-customs-loader](/packages/css-customs-loader/readme.md#configuration)
  - [gatsby-plugin-css-customs](/packages/gatsby-plugin-css-customs/readme.md#configuration)

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

### Caveats

  - Exposing customs and class names in the same object means that we can't use a class name like `.customProperties` because it would get silently overwritten with the `customProperties` object, making it inaccessible.

  - When using custom selectors with CSS Modules, you need to wrap every usage with `:global()`, otherwise the classes inside will be processed with CSS Modules, so resulting selectors will not match the ones exported in `customSelectors`.

## Advanced example

If you didn't get enough, [here's a more complex example][advanced-example] of how you might use css-customs-loader to make your codebase more DRY without compromising CSS authoring experience.

## Flexibility

If you know that wepback loaders are executed from right to left and that postcss-preset-env strips away experimental features by default, you might be wondering how css-customs-loader is able to export customs so late in the execution phase, when the CSS file is already processed.

It does this by retrieving the contents of the module right before being processed with postcss-loader. This also means that if you happen to be combining postcss-loader with e.g. sass-loader, css-customs-loader will apply sass-loader before parsing it!

Plugins specified in your PostCSS configuration are also ordered. If you happen to use a plugin like [postcss-brand-colors][] _before_ postcss-preset-env to set a custom property to a brand color, you can count on css-customs-loader to apply that plugin before exporting customs!

In summary, if you have a complicated set up of webpack loaders and PostCSS plugins, as long as you put them in the correct order you can expect css-customs-loader to behave the way you want.

[postcss-preset-env]: https://preset-env.cssdb.org/
[postcss-loader]: https://github.com/postcss/postcss-loader
[importFrom]: https://github.com/csstools/postcss-preset-env#importfrom
[exportTo]: https://github.com/csstools/postcss-preset-env#exportTo
[caniuse-custom-properties]: https://caniuse.com/#feat=css-variables
[css-modules]: https://github.com/webpack-contrib/css-loader#modules
[advanced-example]: https://github.com/silvenon/css-customs-loader/blob/master/example
[postcss-brand-colors]: https://github.com/postcss/postcss-brand-colors
