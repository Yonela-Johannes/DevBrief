import requests
from bs4 import BeautifulSoup
import json
import os
import sys
from datetime import datetime
import feedparser
import subprocess

# Configuration - Multiple News Sources
SOURCES = [
    # Hacker News
    {
        "url": "https://news.ycombinator.com/",
        "parser": "hn",
        "name": "Hacker News - Top"
    },
    {
        "url": "https://news.ycombinator.com/newest",
        "parser": "hn",
        "name": "Hacker News - Newest"
    },
    # Dev.to
    {
        "url": "https://dev.to/api/articles?top=7",
        "parser": "devto",
        "name": "Dev.to - Top Articles"
    },
    # Product Hunt (RSS)
    {
        "url": "https://www.producthunt.com/feed",
        "parser": "rss",
        "name": "Product Hunt - Latest"
    },
    # TechCrunch (RSS)
    {
        "url": "https://techcrunch.com/feed/",
        "parser": "rss",
        "name": "TechCrunch - Latest"
    },
    # Smashing Magazine (RSS)
    {
        "url": "https://www.smashingmagazine.com/feed/",
        "parser": "rss",
        "name": "Smashing Magazine - Web Design"
    },
    # CSS-Tricks (RSS)
    {
        "url": "https://css-tricks.com/feed/",
        "parser": "rss",
        "name": "CSS-Tricks - Web Development"
    },
]
DATA_FILE = "data.json"

def fetch_data(url, headers=None):
    """Fetch data from URL with proper user agent and timeout"""
    try:
        default_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
        }
        if headers:
            default_headers.update(headers)
        
        response = requests.get(url, timeout=10, headers=default_headers)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def parse_hn(soup, base_url):
    """Parse Hacker News articles"""
    articles = []
    rows = soup.find_all('tr', class_='athing')
    
    for row in rows:
        try:
            title_element = row.find('span', class_='titleline').find('a')
            if title_element:
                title = title_element.get_text().strip()
                link = title_element['href'].strip()
                
                # Handle relative URLs
                if not link.startswith('http'):
                    link = "https://news.ycombinator.com/" + link

                articles.append({
                    "title": title,
                    "url": link,
                    "timestamp": datetime.now().isoformat(),
                    "source": "Hacker News" 
                })
        except (AttributeError, KeyError, TypeError):
            continue
    return articles

def parse_reddit(json_data):
    """Parse Reddit JSON API response"""
    articles = []
    try:
        data = json.loads(json_data)
        posts = data.get('data', {}).get('children', [])
        
        for post in posts:
            try:
                post_data = post['data']
                articles.append({
                    "title": post_data['title'].strip(),
                    "url": f"https://reddit.com{post_data['permalink']}",
                    "timestamp": datetime.now().isoformat(),
                    "source": f"Reddit - {post_data.get('subreddit', 'programming')}"
                })
            except (KeyError, TypeError):
                continue
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        print(f"Error parsing Reddit JSON: {e}")
    
    return articles

def parse_devto(json_data):
    """Parse Dev.to API response"""
    articles = []
    try:
        data = json.loads(json_data)
        
        for article in data:
            try:
                articles.append({
                    "title": article['title'].strip(),
                    "url": article['url'].strip(),
                    "timestamp": article.get('published_at') or datetime.now().isoformat(),
                    "source": "Dev.to"
                })
            except (KeyError, TypeError):
                continue
    except (json.JSONDecodeError, TypeError) as e:
        print(f"Error parsing Dev.to JSON: {e}")
    
    return articles

def parse_rss(rss_content):
    """Parse RSS/Atom feeds"""
    articles = []
    try:
        feed = feedparser.parse(rss_content)
        feed_title = feed.feed.get('title', 'RSS Feed').strip()

        for entry in feed.entries[:15]:  # Limit to 15 items per feed
            try:
                title = entry.get('title', '').strip()
                link = entry.get('link', '').strip()
                if not title or not link:
                    continue

                pub_time = entry.get('published') or entry.get('updated') or datetime.now().isoformat()

                articles.append({
                    "title": title,
                    "url": link,
                    "timestamp": pub_time,
                    "source": feed_title
                })
            except (KeyError, TypeError, AttributeError):
                continue
    except Exception as e:
        print(f"Error parsing RSS: {e}")
    
    return articles

def parse_html(html_content, parser_type, url):
    """Route parsing based on parser type"""
    if not html_content:
        return []
        
    if parser_type == 'hn':
        soup = BeautifulSoup(html_content, 'html.parser')
        return parse_hn(soup, url)
    elif parser_type == 'reddit':
        return parse_reddit(html_content)
    elif parser_type == 'devto':
        return parse_devto(html_content)
    elif parser_type == 'rss':
        return parse_rss(html_content)
    
    return []

def load_existing_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except (json.JSONDecodeError, OSError):
            return []
    return []

def process_and_save(fetched_articles):
    """Process, deduplicate, save articles, and handle git commits efficiently"""
    print(f"\n[*] Processing {len(fetched_articles)} articles...")
    
    existing_data = load_existing_data()
    existing_urls = {item['url'].strip() for item in existing_data if 'url' in item}
    
    new_articles = []
    duplicate_count = 0

    for article in fetched_articles:
        clean_url = article['url'].strip()
        if clean_url not in existing_urls:
            existing_data.append(article)
            existing_urls.add(clean_url)
            new_articles.append(article)
        else:
            duplicate_count += 1

    new_items_count = len(new_articles)
    print(f"\n[RESULTS] {new_items_count} new articles, {duplicate_count} duplicates")

    if new_items_count > 0:
        # Save updated data.json to disk atomically
        try:
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, indent=4, ensure_ascii=False)
            print(f"[+] Saved {len(existing_data)} total articles to {DATA_FILE}")
        except OSError as e:
            print(f"[-] Failed to write {DATA_FILE}: {e}")
            return

        # Handle Git integration safely
        try:
            subprocess.run(["git", "add", DATA_FILE], check=True, capture_output=True)
            commit_msg = f"Add {new_items_count} new articles from aggregator"
            if new_items_count == 1:
                commit_msg = f"Add article: {new_articles[0]['title'][:60]}"

            subprocess.run(["git", "commit", "-m", commit_msg], check=True, capture_output=True)
            print(f"[+] Committed {new_items_count} new articles to Git.")

            # Try git push if remote exists
            push_res = subprocess.run(["git", "push"], capture_output=True, text=True)
            if push_res.returncode == 0:
                print("[+] Git push successful!")
            else:
                print(f"[-] Git push failed: {push_res.stderr.strip()}")
                if os.environ.get("GITHUB_ACTIONS") == "true":
                    sys.exit(1)
                else:
                    print("[i] Local run: git push skipped or rejected (local commit preserved).")
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            print(f"[-] Git command failed: {e}")
            if os.environ.get("GITHUB_ACTIONS") == "true":
                sys.exit(1)
            else:
                print(f"[i] Local run: Git integration step skipped.")
    else:
        print("[i] No new items to save or commit.")

def main():
    print("=" * 60)
    print(">>> DevBrief News Scraper Started")
    print("=" * 60)
    
    all_articles = []
    successful_sources = 0
    failed_sources = 0
    
    for source in SOURCES:
        print(f"\n[*] Scraping: {source['name']}")
        print(f"    URL: {source['url']}")
        
        html = fetch_data(source['url'])
        if html:
            articles = parse_html(html, source['parser'], source['url'])
            if articles:
                print(f"    [+] Found {len(articles)} articles")
                all_articles.extend(articles)
                successful_sources += 1
            else:
                print(f"    [!] No articles found")
                failed_sources += 1
        else:
            print(f"    [-] Failed to retrieve data")
            failed_sources += 1
    
    print("\n" + "=" * 60)
    print(f"[SUMMARY] {successful_sources} sources succeeded, {failed_sources} sources failed")
    print(f"[TOTAL] {len(all_articles)} articles collected")
    print("=" * 60)
    
    if all_articles:
        process_and_save(all_articles)
    else:
        print("[!] No articles found across all sources.")

if __name__ == "__main__":
    main()
