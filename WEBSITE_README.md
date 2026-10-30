# DevBrief

A minimal, self-hosted tech news reader that brings developer-focused articles from multiple sources into one place.

DevBrief aggregates technology and software development news into a single, searchable interface. Browse the latest articles, explore different publications, and stay informed without the noise of multiple platforms.

## Features

### News Discovery
- **Aggregated Feed** — Browse articles collected from multiple developer-focused sources.
- **Live Search** — Find articles by title or URL as you type.
- **Source Filtering** — Filter the feed by individual publications, including Hacker News, DEV Community, and other configured sources.
- **Publication Times** — See when articles were published, with relative timestamps.
- **Direct Access** — Open original articles in a new tab.

### Overview & Statistics
- **Article Count** — See the total number of collected articles.
- **Source Overview** — Track the number of unique publications represented in the feed.
- **Last Updated** — Check when the underlying dataset was last refreshed.

### Interface & Experience
- Minimal, content-first interface.
- Clean typography and generous spacing.
- Responsive layouts for desktop, tablet, and mobile.
- Subtle transitions and interactive feedback.
- Lightweight implementation using vanilla HTML, CSS, and JavaScript.

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
├── index.html       # Main website and interface
├── data.json        # Aggregated news dataset
├── scraper.py       # News collection and data generation
├── server.py        # Local development server
└── README.md        # Project documentation
```

*The structure above represents the expected core files. Additional project files may exist.*

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
  index.html
     │
     ▼
 Search · Filter · Read
```

1. **Collect** — The scraper retrieves articles from configured news sources.
2. **Store** — Collected articles are written to `data.json`.
3. **Display** — The website loads and renders the dataset.
4. **Explore** — Search, filtering, and article navigation happen directly in the browser.

To refresh the feed, run the scraper again and reload the website.

## Customization

DevBrief uses CSS variables to keep its visual styling easy to maintain.

To customize the theme, edit the variables defined in `index.html`:

```css
:root {
  --primary: #1a1a1a;
  --accent: #0066ff;
  --text-dark: #1a1a1a;
  --text-light: #666666;
  --border: #e5e5e5;
}
```

Adjust these values to change the interface's colors and visual identity.

## Technical Overview

| Area | Implementation |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 |
| Functionality | Vanilla JavaScript |
| Data format | JSON |
| Collection | Python |
| Local server | Python |
| Dependencies | No frontend dependencies |
| Build process | Not required |

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

## Design Principles

DevBrief is built around a few straightforward principles:

- **Simplicity** — Make discovering technology news effortless.
- **Clarity** — Keep the interface focused on the content.
- **Speed** — Avoid unnecessary dependencies and processing.
- **Accessibility** — Keep the experience usable across screen sizes.
- **Ownership** — Keep the data and reading experience under your control.

## License

See the repository's license file for usage and distribution terms.

---

**DevBrief** — Less noise. More signal. Stay curious.