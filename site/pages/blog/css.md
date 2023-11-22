---
slug: /blog/css-nice-custom-link-styles
collection: blog
description: What goes into styling HTML links?
---

::partial[nav]

# Link Style Best Practices

## Introduction

When you're coming up with a theme for your website, you'll need to style your [links](#).

---

Let's prime ourselves to think about links with some background on HTML `<a>` tags.

## Links

In web browsers, links are stateful and interactive. Let's think about all of the different states a link can be.

- unvisited
- visited
- focus
- hover
- click

If the user has never visited the link, it'll appear to them in the `unvisited` state. If the user has previously viewed the link, it'll appear in the `visited` state.

If the user is using the keyboard and tabbing through your web page, when they land upon the link, it'll appear in the `focus` state. If the user is using the mouse and hovers over the link, it'll appear in the `hover` state.

Finally, if a user clicks on your link, on mouse down it'll appear in the `click` state, then return to the previous state on mouse up (generally).

These states aren't mutually exclusive. Let's visualize them in a matrix to show the actual surface area we'll need to cover. Note that there are four aspects of a link (visited, focusing, hovering, clicked) but we don't need to distinguish between all possible combinations of these.

| visited? | focusing? | hovering? | clicked? | state         |
|----------|-----------|-----------|----------|---------------|
| no       | no        | no        | no       | ***default*** |
| yes      | no        | no        | no       | ***visited*** |
| --       | yes       | --        | --       | ***focus***   |
| --       | --        | yes       | --       | ***focus***   |
| --       | --        | --        | clicked  | ***clicked*** |

If the user isn't interacting with the link, we display it as `default` or `visited`.

If the user is focusing or hovering the link, we display it as `focus`.

If the user is clicking the link, we display it as `clicked`.

---

Links are presented to the user and the user can interact with the links, changing their visual state. Let's see how we can style each link state using CSS.


## Technical implementation

If we want to style our links according to the rules above, we can style our links with the following css:

```css
a:link {
    /* default */
}

a:visited {
    /* visited */
}

a:focus,
a:hover {
    /* focus */
}

a:active {
    /* clicked */
}
```

Note that we need to put the link styles in a specific order for them to be applied as we expect. This is known as LVHA-order. [^1]

It also helps if the styles each have the same specificity, to avoid issues where earlier rules are used over later ones.

By default, most browsers apply a `color` and `text-decoration: underline` to links. Default focus styles include an `outline` property. We can also explicitly set `cursor` to choose which mouse pointer to use.  Let's add our own styles to replace these. To help keep our CSS maintainable, we'll only use CSS variables to style our links.

```css
:root {
    /* default styles, applies to all links */
    --link--color: black;
    --link--text-decoration: none;
    --link--outline: none;
    --link--cursor: default;
    
    /* link variants, override default styles */
    --link-visited--color: black;
    
    --link-focus--cursor: pointer;
    --link-focus--color: green;

    --link-active--cursor: pointer;
    --link-active--color: red;
}

a:link {
    color: var(--link--color);
	text-decoration: var(--link--text-decoration);
	outline: var(--link--outline);
    cursor: var(--link--cursor);
}

a:visited {
    --link--color: var(--link-visited--color);
}

a:focus,
a:hover {
    --link--color: var(--link-focus--color);
    --link--cursor: var(--link-focus--cursor);
}

a:active {
    --link--color: var(--link-active--color);
    --link--cursor: var(--link-active--cursor);
}
```

In the above snippet, we declare some CSS variables to control the styling of our links. Then, in the default selector we apply the styles based on the variables. In each of the variants (visited, focus, and active) we only modify the variables. This setup helps us identify all of the variations at a glance by looking at the variables and know exactly what styles will be applied to links by looking at the default selector.

Now, all of the links on our page have custom styles. Let's say we want multiple styles for links. For example, navigation links and other links have different styles. Since we specified all of our link styles as CSS variables, we only need to update the variables elsewhere.

```css
nav {
    /* default styles, applies to all links */
    --link--color: black;
    --link--text-decoration: none;
    --link--outline: none;
    --link--cursor: default;
    
    /* link variants, override default styles */
    --link-visited--color: black;
    
    --link-focus--cursor: pointer;
    --link-focus--color: green;

    --link-active--cursor: pointer;
    --link-active--color: red;
}
```

Consider the code above. Any links inside `nav` elements will use the specified CSS variables, overriding the global styles.

If we weren't using CSS variables, we'd have to repeat the link selectors every time we want a new link theme. With CSS variables, we only need to target a single element to re-theme the links.

---

Now that we know the technical details of implementing link styles and we know how to override browser default link styles, you might be thinking what styles you should use. This is a good time to think about the design of your links.

## Design

## References

[^1]: [:link - CSS: Cascading Style Sheets | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:link)
