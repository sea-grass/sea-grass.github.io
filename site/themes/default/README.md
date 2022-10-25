# default theme

This theme uses the [BEM](https://en.bem.info/methodology/css/) methodology to structure the CSS.

## How do themes work?

Before we consider themes, we need to understand pages.
The site builder will find all `*.md` files inside your site's `pages/` directory.
Each page must define its own `slug` property, which determines the page's url in the rendered site.
Pages can optionally define other properties, like `theme`.
This property determines which theme will be used for the page.
If a page defines a theme, that theme will be used (if it exists). Otherwise, the "default" theme will be used.

The site builder will find all `*.css` files inside your site's `themes/<theme>` directory.
The content of all css files will get concatenated and injected inline into a style tag inside your page.
To ensure proper ordering of your styles, you must take advantage of alphabetical ordering of file paths.

> There may come a point in the future where the CSS files are written to an external file and included via a link tag.
