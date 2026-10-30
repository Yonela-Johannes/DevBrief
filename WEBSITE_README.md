# DevBrief

A minimal, self-hosted tech news reader that brings developer-focused articles from multiple sources into one place.

DevBrief aggregates technology and software development news into a single, searchable interface. Browse the latest articles, explore different publications, and stay informed without the noise of multiple platforms.

## Features

### News Discovery
- **Aggregated Feed** — Browse articles collected from multiple developer-focused sources.
- **Live Search** — Find articles by title, URL, or domain as you type (with shortcut `/`).
- **Source Filtering** — Multi-select dropdown filtering for individual publications (Hacker News, DEV Community, TechCrunch, Product Hunt, Smashing Magazine, CSS-Tricks, etc.).
- **Category Navigation** — Tabbed navigation for Technology, Development, Products, Startups, Web & Design, Research & AI, and Community.
- **Publication Times** — See when articles were published, with relative timestamps.
- **Direct Access** — Open original articles securely in a new tab.

### Overview & Statistics
- **Article Count** — Track total and matching article counts dynamically.
- **Source Overview** — See active sources represented in the current selection.
- **Last Updated** — Check when the underlying dataset was last refreshed.

### Interface & Experience
- Modern, dark-first editorial interface with clean typography and comfortable spacing.
- High-contrast, legible headlines and metadata badges.
- Keyboard navigation (Press `/` to search, `Esc` to clear/close).
- Responsive layout optimized for desktop, tablet, and mobile viewports.
- Lightweight implementation using vanilla HTML, CSS, and modular JavaScript.

## Getting Started

### Prerequisites

- Python 3.x
- A modern web browser.
- A generated `data.json` file.

No Node.js installation, package manager, build process, or frontend dependencies are required.

### 1. Generate the News Feed

Run the scraper to collect articles and generate the dataset:

```bash
python scraper.py
```

This generates or updates `data.json`, which powers the website.

### 2. Start the Website

**Recommended:**

```bash
python server.py
```

The server starts locally at:

[http://localhost:8080](http://localhost:8080)

The provided server script also handles opening the website in your default browser.

Alternatively, use Python's built-in HTTP server:

```bash
python -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

### 3. Browse DevBrief

Once the website is running, you can search articles, filter by source, explore the latest updates, and open original publications.

## Project Structure

```text
DevBrief/
├── index.html            # Main website application shell
├── assets/
│   ├── css/
│   │   ├── styles.css    # Design tokens, variables & base layout
│   │   ├── components.css# Header, controls, stats, categories, cards & states
│   │   └── responsive.css# Mobile & tablet breakpoints
│   └── js/
│       ├── utils.js      # Escaping, relative dates, domain parsing
│       ├── data.js       # Data fetching, normalization & category rules
│       ├── filters.js    # Search & multi-select filtering logic
│       ├── stats.js      # Dynamic metrics calculations
│       ├── articles.js   # Feed grid, card rendering & state views
│       └── app.js        # Main app initialization & event wiring
├── data.json             # Aggregated news dataset
├── scraper.py            # News collection and data generation
├── server.py             # Local development server
├── requirements.txt      # Python scraper dependencies
├── WEBSITE_README.md     # Website documentation
└── README.md             # Project overview
```

## How It Works

DevBrief separates news collection from news presentation.

```text
News Sources
     │
     ▼
  scraper.py
     │
     ▼
  data.json
     │
     ▼
  index.html (Vanilla JS & Modular CSS)
     │
     ▼
 Search · Filter · Categorize · Read
```

1. **Collect** — The scraper retrieves articles from configured news sources.
2. **Store** — Collected articles are written to `data.json`.
3. **Display** — The website loads and normalizes the dataset.
4. **Explore** — Search, source filtering, category navigation, and article reading happen directly in the browser.

To refresh the feed, run the scraper again and reload the website.

## Customization

DevBrief uses CSS variables defined in `assets/css/styles.css` to manage theme styling:

```css
:root {
    --bg-app: #090d16;
    --bg-surface: #111726;
    --accent-primary: #38bdf8;
    --text-primary: #f8fafc;
    --border-subtle: #1e293b;
}
```

Adjust these values to change the interface's color scheme and visual identity.

## Technical Overview

| Area | Implementation |
|---|---|
| Structure | HTML5 Semantic Markup |
| Styling | Modular CSS3 |
| Logic | Vanilla Modular JavaScript (ES6+) |
| Data format | Structured JSON |
| Collection | Python 3 (requests, BeautifulSoup, feedparser) |
| Local server | Python SimpleHTTPRequestHandler |
| Dependencies | Zero frontend dependencies |
| Build process | None required |

## Troubleshooting

### Data file not found

Make sure `data.json` exists in the same directory as `index.html`.

If it doesn't, generate it:

```bash
python scraper.py
```

### Unable to connect to the server

Check whether port `8080` is already in use.

You can use another port:

```bash
python -m http.server 8081
```

### Articles are not displaying correctly

- Verify that `data.json` contains valid JSON.
- Check the browser developer console for JavaScript errors.
- Confirm that the dataset follows the structure expected by the website.

### Changes to the dataset are not appearing

Run the scraper again and refresh the browser. If necessary, perform a hard refresh with `Ctrl + Shift + R`.

---

**DevBrief** — Less noise. More signal. Stay curious.
