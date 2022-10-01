---
slug: /directives
---

[Back home](/)

# Directives

Markdown [generic directives](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) are a proposed syntax to extend markdown with custom features/plugins while still remaining fairly human readable.

This page demos the directives I've added to this site's markdown processor (based on [remark](https://github.com/remarkjs/remark)).

There are three kinds of directives: text, leaf, and container.

## Text Directives

Text directives start with a single colon (`:`).

### Bold

In markdown, you can wrap content with two asterisks to **bold** it. This directive reproduces this behaviour. This text will be :bold[bolded]! This directive is an example of how directives can be created and shouldn't be used in actual markdown documents.

### Crossed out

The `:crossedout[content]` directive will cross out the content ~~like this~~. It's another example directive that mirrors the functionality of markdown's own syntax.

Example:

:crossedout[This is cool!]

## Leaf Directives

### Latest Page

The `::pagelatest[collection]` directive looks for all pages, sorts them by date, and injects
the content of the most recent page in the collection.

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