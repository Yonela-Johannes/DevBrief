# DevBrief

**A curated stream of technology news, collected from across the web.**

DevBrief is a Python-powered news aggregation tool that brings developer news, technology discussions, and emerging research together in one place.

It collects articles from multiple sources, normalizes them into a structured dataset, filters duplicates, and maintains a Git-backed history of newly discovered content.

The result is a continuously growing archive of technology news that can be explored through a lightweight web interface.

## Overview

DevBrief is built around three core ideas:

- **Discover** — Collect interesting articles from multiple technology communities and publications.
- **Organize** — Normalize, deduplicate, and store articles in a consistent JSON format.
- **Archive** — Track newly discovered articles through Git commits and remote repository history.

The project separates data collection from presentation, keeping the aggregation engine lightweight and the reading experience simple.

## Features

### News Aggregation
- Multi-source article collection.
- Support for HTML pages, JSON APIs, and RSS/Atom feeds.
- Configurable news sources and parsing strategies.
- Extraction of article titles, URLs, timestamps, and source information.

### Data Management
- URL-based duplicate detection.
- Structured JSON storage.
- Preservation of previously collected articles.
- Consistent article metadata across different sources.

### Git Integration
- Individual commits for newly discovered articles.
- Descriptive commit messages based on article titles.
- Git history as an archive of collected content.
- Optional remote repository synchronization.

### Reliability
- Request timeouts and HTTP headers.
- Source-specific parsing.
- Error handling for unavailable or malformed sources.
- Console logging with collection progress and execution summaries.

## Sources

DevBrief currently supports the following configured sources:

| Source | Collection Method | Content |
|---|---|---|
| Hacker News — Top | HTML | Popular technology discussions |
| Hacker News — Newest | HTML | Recently submitted stories |
| Reddit — r/programming | JSON API | Programming discussions |
| Reddit — r/technology | JSON API | General technology news |
| DEV Community | REST API | Developer articles |
| Product Hunt | RSS | New products and technology launches |
| arXiv — Computer Science AI | RSS | Artificial intelligence research |

Sources are independently configured, allowing individual feeds to be maintained or expanded without changing the overall collection workflow.

## Getting Started

### Requirements

- Python 3.7 or later.
- Git.
- pip.
- Internet connection.

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Yonela-Johannes/DevBrief.git
cd DevBrief
```

**2. Install dependencies**

```bash
pip install -r requirements.txt
```

**3. Configure Git**

If the repository has not already been initialized:

```bash
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

**4. Run the scraper**

```bash
python scraper.py
```

DevBrief will begin collecting articles from its configured sources, process the results, and save newly discovered content.

## How It Works

The collection pipeline follows a straightforward process:

```text
       Configured Sources
               |
               v
        HTTP Requests
               |
               v
         Source Parsers
               |
               v
       Article Normalization
               |
               v
       Duplicate Detection
               |
               v
          data.json
               |
               v
        Git Commit History
               |
               v
       Remote Repository
```

### 1. Collection

The scraper sends HTTP requests to each configured source using appropriate request headers and timeouts.

### 2. Parsing

Each source is processed using its corresponding parser.

Supported formats include:
- HTML pages.
- JSON API responses.
- RSS and Atom feeds.

The scraper extracts the relevant article information and converts it into a common structure.

### 3. Deduplication

Before saving an article, DevBrief checks its URL against previously collected entries.

Existing articles are skipped, preventing repeated discoveries from unnecessarily expanding the dataset.

### 4. Storage

New articles are added to `data.json`, preserving a structured collection that can be consumed by the web interface or other applications.

### 5. Git Archiving

Each newly discovered article can receive its own Git commit, with a descriptive message containing its title.

This creates a chronological history of collected content.

### 6. Remote Synchronization

When remote synchronization is configured, newly created commits can be pushed to the connected repository.

## Data Structure

Articles are stored in `data.json` as a JSON array.

Example:

```json
[
  {
    "title": "Understanding the Future of Artificial Intelligence",
    "url": "https://example.com/article-1",
    "timestamp": "2026-03-07T14:23:45.123456",
    "source": "Hacker News"
  },
  {
    "title": "Getting Started with Modern Python",
    "url": "https://example.com/article-2",
    "timestamp": "2026-03-07T14:24:12.654321",
    "source": "Reddit - r/programming"
  }
]
```

| Field | Description |
|---|---|
| `title` | Article headline |
| `url` | Original article or discussion URL |
| `timestamp` | Recorded collection or publication timestamp, depending on the parser |
| `source` | Name of the originating news source |

The JSON format keeps the dataset portable, readable, and easy to integrate with other applications.

## Project Structure

```text
DevBrief/
├── scraper.py          # Main aggregation engine
├── requirements.txt    # Python dependencies
├── data.json           # Generated article dataset
├── index.html          # Web-based news reader
├── server.py           # Local development server
├── README.md           # Project documentation
├── LICENSE             # Project license
└── .git/               # Version control history
```

Generated files and optional project files may vary depending on the repository configuration.

## Configuration

### Managing News Sources

Sources are configured in `scraper.py` through the `SOURCES` collection.

Example:

```python
SOURCES = [
    {
        "url": "https://example.com/feed.xml",
        "parser": "rss",
        "name": "Example News"
    }
]
```

Add a source using an existing parser or implement a dedicated parser when the source requires custom extraction logic.

### Available Parsers

| Parser | Purpose |
|---|---|
| `hn` | Hacker News HTML extraction |
| `reddit` | Reddit JSON API |
| `devto` | DEV Community REST API |
| `rss` | RSS and Atom feed extraction |

### Request Configuration

Request behavior can be adjusted in the fetching logic.

For example:

```python
response = requests.get(
    url,
    timeout=10,
    headers=default_headers
)
```

Timeouts, request headers, and source-specific behavior can be adapted as needed.

## Dependencies

DevBrief uses a small Python dependency set.

| Package | Purpose |
|---|---|
| `requests` | HTTP requests |
| `beautifulsoup4` | HTML and XML parsing |
| `feedparser` | RSS and Atom feed parsing |

Install everything using:

```bash
pip install -r requirements.txt
```

## Git Integration

Git provides a historical record of newly collected articles.

Example commit history:

```text
abc1234 Add article: Understanding modern AI systems
def5678 Add article: Python performance improvements
ghi9012 Add article: New developments in Kubernetes
```

Individual article commits make it possible to:

- Review when content was discovered.
- Explore historical collection activity.
- Identify changes to the dataset.
- Revert unwanted additions.
- Maintain an archive through repository history.

Git identity must be configured before commits can be created.

Remote synchronization also requires a configured remote and appropriate repository permissions.

## Web Interface

DevBrief includes a lightweight web interface for exploring the collected dataset.

The frontend provides:

- Article discovery and browsing.
- Search across article titles and URLs.
- Filtering by news source.
- Article and source statistics.
- Relative publication timestamps.
- Direct links to original publications.
- Responsive layouts for different screen sizes.

The interface consumes `data.json` independently of the scraper.

For instructions on launching and using the web interface, see the [Web Interface documentation](README-WEB.md), if maintained separately.

## Troubleshooting

### No articles collected

- Check your internet connection.
- Verify that the configured sources are accessible.
- Inspect the console output for individual source errors.
- Confirm that the source's response format has not changed.

### Git commits are failing

Verify your Git identity:

```bash
git config --get user.name
git config --get user.email
```

Check repository status:

```bash
git status
```

Ensure the working directory is writable and that Git is initialized.

### Remote push fails

Check your remote configuration:

```bash
git remote -v
```

Verify that your authentication credentials and repository permissions are valid.

### API rate limiting

Some sources impose request limits.

If a source starts returning rate-limit responses, consider introducing request delays, reducing collection frequency, or respecting the source's published API policies.

### Missing dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## Extending DevBrief

DevBrief is designed to accommodate additional news sources and collection strategies.

Potential extensions include:

- Additional developer communities and technology publications.
- Keyword-based article categorization.
- Topic and tag extraction.
- Improved article relevance ranking.
- Historical trend analysis.
- Email or notification digests.
- Scheduled collection workflows.
- Alternative storage backends such as SQLite or PostgreSQL.

## Contributing

Contributions, improvements, and additional source integrations are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test the collection workflow.
5. Commit your changes.
6. Open a pull request describing the improvement.

When introducing a new source, include its configuration, parsing logic, and appropriate error handling.

## License

Distributed under the MIT License. See the `LICENSE` file for details.

## Author

**Yonela Johannes**

- GitHub: [@Yonela-Johannes](https://github.com/Yonela-Johannes)

---

**DevBrief**

*Less noise. More signal. Stay curious.*