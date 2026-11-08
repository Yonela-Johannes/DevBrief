"""
DevBrief Archive & Dataset Rotation Module
Manages URL deduplication and dataset rotation into fixed 10,000-article archive chunks.
"""

import json
import glob
import os

DATA_FILE = "data.json"
ARCHIVE_DIR = "archives"
MAX_ACTIVE = 5000
CHUNK_SIZE = 10000

def load_existing_urls(data_file=DATA_FILE, archive_dir=ARCHIVE_DIR):
    """
    Load all URLs from data.json and all archive-*.json chunks into a single Set once per run.
    """
    urls = set()

    # Load active data.json
    if os.path.exists(data_file):
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and 'url' in item:
                            urls.add(item['url'].strip())
        except (json.JSONDecodeError, OSError):
            pass

    # Load all archive chunks
    if os.path.exists(archive_dir):
        archive_files = glob.glob(os.path.join(archive_dir, "archive-*.json"))
        for arch_file in archive_files:
            try:
                with open(arch_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and 'url' in item:
                                urls.add(item['url'].strip())
            except (json.JSONDecodeError, OSError):
                pass

    return urls

def rotate_dataset(data_file=DATA_FILE, archive_dir=ARCHIVE_DIR, max_active=MAX_ACTIVE, chunk_size=CHUNK_SIZE):
    """
    If data.json holds more than max_active (5,000) items, rotate the oldest overflow
    into fixed 10,000-article archive chunks, filling the last chunk before starting a new one.
    """
    if not os.path.exists(data_file):
        return

    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            articles = json.load(f)
    except (json.JSONDecodeError, OSError):
        return

    if len(articles) <= max_active:
        return

    os.makedirs(archive_dir, exist_ok=True)

    # Active feed retains the last max_active items (by append order)
    active = articles[-max_active:]
    overflow = articles[:-max_active]

    # Save active data.json
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(active, f, indent=4, ensure_ascii=False)

    # Read existing archive chunks in numerical order
    existing_archives = sorted(glob.glob(os.path.join(archive_dir, "archive-*.json")))

    archive_items = []
    for arch_file in existing_archives:
        try:
            with open(arch_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    archive_items.extend(data)
        except (json.JSONDecodeError, OSError):
            pass

    # Append overflow to historical archive
    total_archive = archive_items + overflow

    # Re-chunk all archives into fixed CHUNK_SIZE chunks
    num_chunks = (len(total_archive) + chunk_size - 1) // chunk_size
    for i in range(num_chunks):
        chunk = total_archive[i * chunk_size : (i + 1) * chunk_size]
        filename = f"archive-{i + 1:03d}.json"
        filepath = os.path.join(archive_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(chunk, f, indent=4, ensure_ascii=False)
