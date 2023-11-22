---
slug: /goku-static-site-builder
collection: projects
title: Goku
---

::partial[nav]

# Goku, a static site generator

> Warning: Under construction.
>
> This webpage is considered a work-in-progress and therefore may not have accurate information.

Goku is a Static Site Generator (SSG).
You write your website content in markdown and it generates a static site for you, ready to deploy anywhere.
It has support for partials, collections, and data-based routing.
It's extensible through css themes, web components, and markdown directives.

## Technical Implementation

Goku uses svelte-kit's `adapter-static` to generate a build directory with all site pages and assets.
Site pages are stored as markdown and are parsed by `remark`. Markdown files are discovered and passed to svelte-kit for processing by `vite`'s glob imports.

```
(site files) ->
vite glob imports ->
(svelte-kit site) ->
svelte-kit build ->
(remark pipeline) ->
remark process site content ->
(build dir)
```

For templating, Goku makes use of Markdown's custom directives to support page/content/collection lookups and partials.

## Getting Started

### Quickstart

Goku 0.1 makes use of svelte-kit, vite, and remark to generate a static site. As long as you have at least Node 20.x installed, you should be good.

Not many Svelte features are used, so this may change later. It is useful for a live-reload dev experience though.
Vite is used for its glob import support, but that'll only be useful as the builder is colocated in the same git repo as the site content, so that'll likely change later.
Remark is used to process the markdown content, so that'll likely be the most stable aspect of the project as we gear up for 1.0.

Right now, the builder is tightly coupled with the site content. You'll have to clone the repo and replace the site content with your own.

To get started:

```
cd scripts/builder
npm install
```

To run the dev server:

```
cd scripts/builder
npm run dev
```

## Build

```
cd scripts/builder
npm run build
```

## Content

### Pages

Pages match the glob `site/pages/**/*.md`. Each page contains frontmatter with a mandatory `slug` field, for routing.
