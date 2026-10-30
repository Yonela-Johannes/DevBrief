import requests
from bs4 import BeautifulSoup
import json
import os
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
    """Fetch data from URL with proper user agent"""
    try:
        default_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com/',
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
                title = title_element.get_text()
                link = title_element['href']
                
                # Handle relative URLs
                if not link.startswith('http'):
                    link = "https://news.ycombinator.com/" + link

                articles.append({
                    "title": title,
                    "url": link,
                    "timestamp": datetime.now().isoformat(),
                    "source": "Hacker News" 
                })
        except AttributeError:
            continue
    return articles

def parse_reddit(json_data):
    """Parse Reddit JSON API response"""
    articles = []
    try:
        data = json.loads(json_data)
        posts = data['data']['children']
        
        for post in posts:
            try:
                post_data = post['data']
                articles.append({
                    "title": post_data['title'],
                    "url": f"https://reddit.com{post_data['permalink']}",
                    "timestamp": datetime.now().isoformat(),
                    "source": f"Reddit - {post_data['subreddit']}"
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
                    "title": article['title'],
                    "url": article['url'],
                    "timestamp": datetime.now().isoformat(),
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
        
        for entry in feed.entries[:15]:  # Limit to 15 items
            try:
                articles.append({
                    "title": entry.get('title', 'No title'),
                    "url": entry.get('link', ''),
                    "timestamp": datetime.now().isoformat(),
                    "source": feed.feed.get('title', 'RSS Feed')
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
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []

def process_and_save(fetched_articles):
    """Process and save articles, committing each new one"""
    print(f"\n[*] Processing {len(fetched_articles)} articles...")
    
    existing_data = load_existing_data()
    existing_urls = {item['url'] for item in existing_data}
    
    new_items_count = 0
    duplicate_count = 0
    commits_made = False
    
    for article in fetched_articles:
        if article['url'] not in existing_urls:
            # Add to memory
            existing_data.append(article)
            existing_urls.add(article['url'])
            
            # Save to file immediately
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, indent=4, ensure_ascii=False)
            
            # Commit immediately
            try:
                short_title = article['title'][:50] + "..." if len(article['title']) > 50 else article['title']
                print(f"    [+] Committing: [{article['source']}] {short_title}")
                subprocess.run(["git", "add", DATA_FILE], check=True)
                subprocess.run(["git", "commit", "-m", f"Add article: {article['title'][:60]}"], check=True)
                commits_made = True
                new_items_count += 1
            except subprocess.CalledProcessError as e:
                print(f"    [-] Git commit failed: {e}")
        else:
            duplicate_count += 1

    print(f"\n[RESULTS] {new_items_count} new articles, {duplicate_count} duplicates")
    
    if commits_made:
        print(f"\n[*] Pushing {new_items_count} new commits...")
        try:
            subprocess.run(["git", "push"], check=True)
            print("[+] Push successful!")
        except subprocess.CalledProcessError as e:
            print(f"[-] Git push failed: {e}")
    else:
        print("[i] No new items to commit.")

def main():
    print("=" * 60)
    print(">>> Multi-Source News Scraper Started")
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
