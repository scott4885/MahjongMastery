#!/usr/bin/env python3
"""
Auto-commenter DRY RUN prototype for Facebook engagement.

- Does NOT post anything.
- Logs what it would comment for manual review.
"""

import random
import time
from datetime import datetime

# === CONFIG ===
POST_URLS = [
    "https://www.facebook.com/examplepage/posts/1234567890",
    "https://www.facebook.com/examplepage/posts/0987654321",
    "https://www.facebook.com/examplepage/posts/1122334455",
]

COMMENT_TEMPLATES = [
    "Great insight—thanks for sharing!",
    "Love the tip here. Always learning something new about Mahjong.",
    "This is a helpful reminder—appreciate you posting it!",
    "Nice perspective! I’ll try this approach in my next game.",
    "Well explained—thanks for breaking it down so clearly.",
]

# DRY RUN only. Never set to False in this prototype.
DRY_RUN = True

# Rate limiting (seconds)
MIN_DELAY = 20
MAX_DELAY = 45

# === LOGIC ===

def pick_comment():
    return random.choice(COMMENT_TEMPLATES)


def log_action(url, comment):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] DRY RUN -> Would comment on: {url}")
    print(f"             Comment: {comment}")
    print("             NOTE: Manual review required before any posting.\n")


def main():
    print("Auto-commenter prototype (DRY RUN only)\n")
    if not DRY_RUN:
        raise RuntimeError("DRY_RUN must remain True in this prototype.")

    for idx, url in enumerate(POST_URLS, start=1):
        comment = pick_comment()
        log_action(url, comment)

        if idx < len(POST_URLS):
            delay = random.randint(MIN_DELAY, MAX_DELAY)
            print(f"Rate limit: sleeping {delay}s before next item...\n")
            time.sleep(delay)

    print("Done. No comments were posted.")


if __name__ == "__main__":
    main()
