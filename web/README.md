# Website (Hugo) Details

This directory contains the source code for the Hugo-based static site, including content, configuration, assets, and theme (which is a git submodule of blowfish repo).

## Structure
- `archetypes/`: Hugo archetypes for new content.
- `assets/`: Custom CSS and images.
- `config/`: Hugo configuration files (TOML).
- `content/`: Markdown content for posts, pages, categories, etc.
- `layouts/`: Custom HTML templates and partials.
- `static/`: Static files (images, JS, manifest, etc.).
- `themes/blowfish/`: Hugo theme (Blowfish). It's a git submodule.

## Build & Serve
- Local development: Can be easily done by execyting in the repo root folder: `hugo serve -s web/ -p 1313`.
- Production build: This is done automatically through GitHub Actions (GHA).

See the main [README](../README.md) for overall project context.
