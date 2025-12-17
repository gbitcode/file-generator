# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

File Generator is a Jekyll-based static web application that generates mock files in various formats (images, text, CSV, PDF, binary, and ZIP files). The application is published as a GitHub Pages site and also available as a Chrome extension. The web app runs entirely client-side with no backend dependencies.

**Live Site:** https://file-generator.gbitcode.com/

## Architecture

### Jekyll Structure
The site uses Jekyll with clean URLs (`permalink: pretty`) and is organized into:
- **Layouts** (`_layouts/`) - Page templates (default, generator, privacy)
- **Includes** (`_includes/`) - Reusable components (header, footer, tabs, etc.)
- **Pages** (root) - Individual generator pages with front matter
- **Assets** - CSS, JavaScript, icons, images

### URL Structure
- Clean URLs with trailing slashes: `/`, `/txt/`, `/csv/`, `/pdf/`, etc.
- Old `.html` URLs automatically redirect to clean URLs via `jekyll-redirect-from` plugin
- Example: `/txt.html` → `/txt/`

### Layouts

**`_layouts/default.html`** - Base layout for all pages:
- HTML structure, `<head>`, `<body>`, footer
- Includes `_includes/head.html` and `_includes/footer.html`

**`_layouts/generator.html`** - Extends default, used by all generator pages:
- Container wrapper (700px max-width)
- Includes header, tabs navigation, progress bar, logs viewer
- Wraps content in a card
- Used by: index.html, txt.html, csv.html, pdf.html, bin.html, zip.html

**`_layouts/privacy.html`** - Extends default, for privacy page:
- Wider container (900px)
- No tabs navigation
- Custom header with title and last updated date

### Includes (Reusable Components)

**`_includes/head.html`** - Complete `<head>` section:
- Google Analytics (conditional via `page.enable_analytics`)
- Meta tags (verification tags for index.html via `page.is_index`)
- Favicon, CSS links (Tailwind, DaisyUI, custom CSS)
- Page-specific scripts via `page.extra_scripts` and `page.generator_script`

**`_includes/header.html`** - Hero section with logo, title, Chrome extension link
- Uses `include.subtitle` parameter

**`_includes/tabs.html`** - Navigation tabs across all generators
- Uses `include.active_tab` parameter to highlight current page

**`_includes/progress-bar.html`** - Progress indicator component

**`_includes/logs-viewer.html`** - Collapsible logs section

**`_includes/footer.html`** - Footer with GbitCode logo and links

### Page Structure

Each generator page (index.html, txt.html, etc.) contains:
1. **Front matter** (YAML) - Layout, title, subtitle, tab ID, scripts, redirects
2. **Form HTML** - Generator-specific form inputs
3. **Inline JavaScript** - Form submission handlers and validation logic

Example front matter:
```yaml
---
layout: generator
title: "Image Generator - generate png, gif, jpg, svg, bmp"
subtitle: "Generate mock image in jpg, png, gif, bmp or svg format."
tab_id: "IMAGE"
generator_script: "js/generators/image.js"
is_index: true  # Only for index.html
redirect_from:  # Only for pages that need old URL redirects
  - /txt.html
---
```

### JavaScript Module Structure

**`js/common.js`** - Shared utilities loaded by all pages:
- `logToUI(message)` - Logs messages to the on-page console
- `updateProgress(percent, text)` - Updates progress bar
- `hideProgress()` - Hides progress bar
- `downloadFile(blob, filename)` - Triggers browser file download
- `showError(message)` - Displays error alerts

**`js/generators/*.js`** - Individual generator modules, one per file type:
- `image.js` - Canvas-based raster image generation + SVG generation
- `text.js` - Plain text file generation
- `csv.js` - CSV file generation with configurable columns
- `pdf.js` - PDF generation using jsPDF library
- `binary.js` - Random binary data generation
- `zip.js` - ZIP archive creation using JSZip library with advanced features

### Generator Pattern

All generators follow this pattern:
1. Main function `generate{Type}(config)` accepts configuration object
2. Logs progress using `logToUI()` and `updateProgress()`
3. Returns a Blob object containing the generated file
4. HTML form handlers in each page call the generator and trigger download

### Size Control

Generators support two modes:
1. **Count-based**: Generate N rows/pages/items
2. **Size-based**: Generate content to reach target file size (KB or MB)

The form UI disables one input when the other is specified (mutual exclusivity).

## External Dependencies

### Jekyll Plugins
- `jekyll-redirect-from` - Handles old `.html` URL redirects

### CSS/JS Libraries
- **Tailwind CSS**: `assets/tailwindcss.js` (local copy)
- **DaisyUI**: `assets/daisyui.4.4.19.full.min.css` (local copy)
- **Custom CSS**: `assets/css/custom.css` - Extracted from inline styles
- **jsPDF**: CDN loaded via `extra_scripts` for PDF generation
- **JSZip**: CDN loaded via `extra_scripts` for ZIP archive creation

### Styling
- DaisyUI theme: `data-theme="light"` on `<html>` tag
- Custom CSS for container widths and logo hover effects
- Container widths: 700px (default), 900px (privacy page)

## Development Workflow

### Local Development

**Install dependencies:**
```bash
# Install Ruby with rbenv (recommended)
brew install rbenv ruby-build
rbenv install 3.3.0
rbenv local 3.3.0

# Install gems
bundle install
```

**Run Jekyll locally:**
```bash
bundle exec jekyll serve

# Site runs at http://localhost:4000/
```

**Making changes:**
- Jekyll auto-rebuilds on file changes
- Refresh browser to see updates
- Restart server if you modify `_config.yml`

### Deployment

The site deploys automatically via GitHub Pages:
1. Push changes to `main` branch
2. GitHub Pages builds the Jekyll site
3. Site updates at https://file-generator.gbitcode.com/

**GitHub Pages compatibility:**
- Uses only whitelisted Jekyll plugins (`jekyll-redirect-from`)
- No custom build process required
- All asset paths are root-relative for proper deployment

## Common Patterns

### Adding a New Generator

1. Create generator JavaScript:
   - `js/generators/{type}.js` with `generate{Type}(config)` function

2. Create page HTML:
   - `{type}.html` in root directory
   - Add front matter with layout: generator, title, subtitle, tab_id, generator_script
   - Add redirect_from for old URL compatibility
   - Include form HTML and inline JavaScript

3. Update navigation:
   - Add tab link in `_includes/tabs.html`
   - Update `sitemap.xml` with new URL

4. Test locally:
   - Run `bundle exec jekyll serve`
   - Verify form works, file generates, navigation links work

### Modifying Layouts or Includes

When changing shared components:
1. Edit files in `_layouts/` or `_includes/`
2. Changes affect all pages using that layout/include
3. Test multiple pages to ensure nothing breaks

### URL Structure

- All internal links use root-relative paths: `/`, `/txt/`, `/privacy/`
- Asset paths use root-relative: `/assets/`, `/js/`, `/icons/`
- External links use full URLs

## File Structure

```
/
├── _config.yml                      # Jekyll configuration
├── _layouts/                        # Page templates
│   ├── default.html                 # Base layout
│   ├── generator.html               # Generator pages layout
│   └── privacy.html                 # Privacy page layout
├── _includes/                       # Reusable components
│   ├── head.html                    # <head> section
│   ├── header.html                  # Hero section
│   ├── tabs.html                    # Navigation tabs
│   ├── progress-bar.html            # Progress indicator
│   ├── logs-viewer.html             # Logs component
│   └── footer.html                  # Footer section
├── index.html, txt.html, csv.html, pdf.html, bin.html, zip.html  # Generator pages
├── privacy.html                     # Privacy policy
├── js/
│   ├── common.js                    # Shared utilities
│   └── generators/                  # Generator modules
│       ├── image.js, text.js, csv.js, pdf.js, binary.js, zip.js
├── assets/
│   ├── css/custom.css               # Custom styles
│   ├── tailwindcss.js               # Tailwind CSS
│   ├── daisyui.4.4.19.full.min.css  # DaisyUI
│   └── gbit.png                     # Logo
├── icons/                           # App icons
├── Gemfile                          # Ruby dependencies
└── sitemap.xml                      # SEO sitemap
```

## Notes

- Jekyll builds to `_site/` directory (git ignored)
- Uses `permalink: pretty` for clean URLs
- Google Analytics ID and other site variables in `_config.yml`
- No testing framework in place
- Chrome extension version exists separately (referenced in UI but not in this repo)
