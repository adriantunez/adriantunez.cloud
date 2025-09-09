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
│   │   └── custom.css          # Custom CSS overrides
│   └── img/                    # Site images and logos
├── config/
│   └── _default/               # Hugo configuration files
│       ├── hugo.toml           # Main Hugo configuration
│       ├── languages.en.toml   # Language-specific settings
│       ├── markup.toml         # Markdown rendering config
│       ├── menus.en.toml       # Navigation menus
│       └── params.toml         # Theme parameters
├── content/
│   ├── _index.md               # Homepage content
│   ├── about/                  # About page and CV
│   ├── contact/                # Contact page
│   ├── posts/                  # Blog posts
│   └── categories/             # Content categories
├── layouts/
│   ├── 404.html                # Custom 404 page
│   ├── _default/               # Default layouts
│   └── partials/               # Reusable components
├── static/                     # Static assets (favicons, JS, etc.)
└── themes/
    └── blowfish/               # Blowfish theme (git submodule)
```
