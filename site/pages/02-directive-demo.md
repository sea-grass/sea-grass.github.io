---
slug: /directives
---

::partial[nav]

# Directives

Markdown [generic directives](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) are a proposed syntax to extend markdown with custom features/plugins while still remaining fairly human readable.

This page demos the directives I've added to this site's markdown processor (based on [remark](https://github.com/remarkjs/remark)).

There are three kinds of directives: text, leaf, and container.

## Text Directives

Text directives start with a single colon (`:`).

### Bold

:::details
::summary[`:bold[bolded]`]
:bold[bolded]
:::

In markdown, you can wrap content with two asterisks to **bold** it. This directive reproduces this behaviour. This text will be :bold[bolded]! This directive is an example of how directives can be created and shouldn't be used in actual markdown documents.

### Crossed out

:::details
::summary[`:crossedout[This is cool!]`]
:crossedout[This is cool!]
:::

The `:crossedout[content]` directive will cross out the content ~~like this~~. It's another example directive that mirrors the functionality of markdown's own syntax.

## Leaf Directives

### Latest Page

:::details
::summary[`::pagelatest[blog]`]
::pagelatest[blog]
:::

The `::pagelatest[collection]` directive looks for all pages, sorts them by date, and injects
the content of the most recent page in the collection.

### Collection

:::details
::summary[`::collection[blog]`]
::collection[blog]
:::

## Container Directives

### Inline List

The `:::inlineList` directive renders a markdown list inline by wrapping it in a container div.

- Regular markdown lists
- Appear in list form
- Like this

:::inlineList
- Inline lists
- Are still semantically lists
- but appear inline
:::