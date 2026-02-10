#!/usr/bin/env python3
"""
Meta Graph API Posting Script
Posts images + captions to Facebook Page and Instagram
"""
import os
import sys
import requests
from pathlib import Path

# Load environment variables
def load_env(env_file='../.env.meta'):
    env_path = Path(__file__).parent / env_file
    env_vars = {}
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    return env_vars

def post_to_facebook(page_id, page_token, message, image_path=None):
    """Post to Facebook Page"""
    url = f"https://graph.facebook.com/v24.0/{page_id}/photos"
    
    data = {
        'access_token': page_token,
        'message': message
    }
    
    if image_path:
        with open(image_path, 'rb') as img:
            files = {'source': img}
            response = requests.post(url, data=data, files=files)
    else:
        # Text-only post
        url = f"https://graph.facebook.com/v24.0/{page_id}/feed"
        response = requests.post(url, data=data)
    
    return response.json()

def post_to_instagram(ig_id, ig_token, caption, image_url):
    """Post to Instagram (requires public image URL)"""
    # Step 1: Create media container
    create_url = f"https://graph.facebook.com/v24.0/{ig_id}/media"
    create_data = {
        'image_url': image_url,
        'caption': caption,
        'access_token': ig_token
    }
    
    create_response = requests.post(create_url, data=create_data)
    creation_id = create_response.json().get('id')
    
    if not creation_id:
        return create_response.json()
    
    # Step 2: Publish container
    publish_url = f"https://graph.facebook.com/v24.0/{ig_id}/media_publish"
    publish_data = {
        'creation_id': creation_id,
        'access_token': ig_token
    }
    
    publish_response = requests.post(publish_url, data=publish_data)
    return publish_response.json()

def main():
    # Load credentials
    env = load_env()
    
    PAGE_ID = env.get('PAGE_ID')
    PAGE_TOKEN = env.get('PAGE_ACCESS_TOKEN')
    IG_ID = env.get('IG_BUSINESS_ID')
    IG_TOKEN = env.get('IG_ACCESS_TOKEN')
    
    if len(sys.argv) < 3:
        print("Usage:")
        print("  python post_to_meta.py facebook <caption> [image_path]")
        print("  python post_to_meta.py instagram <caption> <image_url>")
        print("  python post_to_meta.py both <caption> <image_path> <image_url>")
        sys.exit(1)
    
    platform = sys.argv[1]
    caption = sys.argv[2]
    
    if platform == 'facebook':
        image_path = sys.argv[3] if len(sys.argv) > 3 else None
        result = post_to_facebook(PAGE_ID, PAGE_TOKEN, caption, image_path)
        print(f"✅ Facebook: {result}")
    
    elif platform == 'instagram':
        if len(sys.argv) < 4:
            print("❌ Instagram requires image_url")
            sys.exit(1)
        image_url = sys.argv[3]
        result = post_to_instagram(IG_ID, IG_TOKEN, caption, image_url)
        print(f"✅ Instagram: {result}")
    
    elif platform == 'both':
        if len(sys.argv) < 5:
            print("❌ Both requires image_path and image_url")
            sys.exit(1)
        image_path = sys.argv[3]
        image_url = sys.argv[4]
        
        fb_result = post_to_facebook(PAGE_ID, PAGE_TOKEN, caption, image_path)
        print(f"✅ Facebook: {fb_result}")
        
        ig_result = post_to_instagram(IG_ID, IG_TOKEN, caption, image_url)
        print(f"✅ Instagram: {ig_result}")
    
    else:
        print(f"❌ Unknown platform: {platform}")
        sys.exit(1)

if __name__ == '__main__':
    main()
