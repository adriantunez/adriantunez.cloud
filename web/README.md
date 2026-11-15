# Website (Hugo)

> Hugo-based static site source for adriantunez.cloud

This directory contains the complete source code for the Hugo-based static website, including content, configuration, assets, and the Blowfish theme (managed as a git submodule).

## Overview

The website is built with [Hugo](https://gohugo.io/), a fast and flexible static site generator, using the modern [Blowfish](https://blowfish.page/) theme. It features a clean, responsive design optimized for technical blogging and professional presentation.

## 📁 Directory Structure

```
web/
├── archetypes/
│   └── default.md              # Content templates for new posts
├── assets/
│   ├── css/
│   │   ├── custom.css          # Site styles
│   │   └── schemes/adri.css    # Colour scheme (teal accent)
│   ├── icons/                  # Extra SVG icons
│   ├── img/                    # Site images and logos
│   └── js/                     # Newsletter and support widget scripts
├── config/
│   ├── _default/               # Hugo configuration (production)
│   │   ├── hugo.toml           # Main Hugo configuration
│   │   ├── languages.en.toml   # Author, headline and bio
│   │   ├── markup.toml         # Markdown rendering config
│   │   ├── menus.en.toml       # Navigation menus
│   │   └── params.toml         # Theme parameters
│   └── preview/                # PR previews: noindex, no sitemap or robots.txt
├── content/
│   ├── _index.md               # Homepage content
│   ├── about/                  # About, background and career
│   ├── books/                  # Book recommendations
│   ├── contact/                # Contact page
│   ├── newsletter/             # Newsletter page
│   ├── posts/                  # Blog posts
│   ├── support/                # Lightning and coffee support page
│   └── categories/             # Content categories
├── i18n/
│   └── en.yaml                 # Text overrides (e.g. 404 page)
├── layouts/
│   ├── 404.html                # Custom 404 page
│   ├── partials/               # Home, newsletter, support widget, post dates
│   └── ...                     # Page layouts (about, books, contact, posts, support)
├── static/                     # Favicons and web manifest
└── themes/
    └── blowfish/               # Blowfish theme (git submodule)
```

## Local development

```bash
hugo server                       # http://localhost:1313
hugo --environment preview        # build like a PR preview
```

The Hugo version is pinned in `.tool-versions` at the repository root.
