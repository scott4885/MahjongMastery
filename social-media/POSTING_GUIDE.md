# Meta Graph API Posting Guide

## ✅ Setup Complete
- Facebook Page ID: `950729831465641`
- Instagram Business ID: `17841480671870490`
- Tokens stored in `.env.meta` (DO NOT commit this file!)

## 📝 Post to Facebook

### Text-only:
```bash
python3 post_to_meta.py facebook "Your caption here with #hashtags"
```

### With image:
```bash
python3 post_to_meta.py facebook "Caption" graphics/01-never-pass-jokers.png
```

## 📸 Post to Instagram

**Note:** Instagram requires a **public image URL** (not local file).

### Option 1: Upload to Facebook first, then use that URL
```bash
# 1. Post to FB (gets you a public URL)
# 2. Get the image URL from FB post
# 3. Use that URL for IG
python3 post_to_meta.py instagram "Caption" https://url-to-image.jpg
```

### Option 2: Upload images to a CDN/hosting first
Host your graphics somewhere public, then:
```bash
python3 post_to_meta.py instagram "Caption" https://yourcdn.com/image.png
```

## 🚀 Post to Both (when you have public image URL)
```bash
python3 post_to_meta.py both "Caption" graphics/image.png https://public-url.jpg
```

## 📋 Batch Posting Script (Coming Soon)
We can create a script that:
1. Reads POST_QUEUE.md
2. Posts all 10 graphics to Facebook
3. Cross-posts to Instagram
4. Logs what was posted

## 🔐 Security Notes
- `.env.meta` is in `.gitignore` — never commit tokens
- Rotate tokens periodically
- Page/IG tokens expire after 60 days (long-lived)
- To refresh: regenerate in Graph API Explorer

## 📊 What's Posted So Far
- ✅ 2 test posts to Facebook (text + image working)
- Next: Batch post all 10 branded graphics

## 🛠️ Troubleshooting
- **"Invalid OAuth"**: Token expired, regenerate
- **"Unknown path"**: Wrong page ID
- **IG "Insufficient permissions"**: Check app roles + IG tester status
- **Image too large**: Resize to <8MB, 1080x1080 recommended
