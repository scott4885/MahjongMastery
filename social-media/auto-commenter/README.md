# Auto-Commenter (Dry Run Prototype)

**Status:** DRY RUN ONLY — no automated posting is performed.

This prototype simulates commenting on competitor Mahjong Facebook posts by **logging** what *would* be posted. It is designed for safe review and iteration before any real-world automation.

## What It Does
- Loads a list of Facebook post URLs (hardcoded in the script)
- Chooses from a list of **safe, friendly** comment templates
- Logs actions **only** (no posting)
- Adds rate-limiting delays between items
- Emphasizes **manual review** before any real posting

## Why Dry Run Only
Facebook’s platform policies and community guidelines can be strict about automation. This tool is intentionally **non-posting** so you can:
- Review wording and tone
- Check relevance for each post
- Avoid account restrictions or bans

## Risks & Limits of Automation on Facebook
- **Policy violations** can lead to post removal or account restrictions
- **Spam detection** may flag repetitive or automated behavior
- **Context mismatch** can harm brand reputation if comments feel generic
- **Access limits** (rate limits, API restrictions) can change without notice

## Usage
From the `MahjongMastery` project root:

```bash
python3 social-media/auto_commenter.py
```

## Manual Review Checklist
Before any real posting (if ever enabled), ensure:
- Each comment is relevant to the specific post
- Tone is friendly and non-promotional
- Volume is low enough to avoid spam signals
- You comply with Facebook’s latest policies

---
**Reminder:** This prototype does not post anything. It only logs simulated actions.
