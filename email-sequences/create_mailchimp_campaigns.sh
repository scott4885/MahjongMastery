#!/usr/bin/env bash
set -euo pipefail
API_KEY="${MAILCHIMP_API_KEY}"
SERVER="us13"
LIST_ID="1cc11f7750"
BASE="https://${SERVER}.api.mailchimp.com/3.0"
AUTH="anystring:${API_KEY}"

create_campaign() {
  local title="$1" subject="$2" html="$3"
  # Create campaign
  local resp
  resp=$(curl -sS -u "$AUTH" -X POST "${BASE}/campaigns" \
    -H 'Content-Type: application/json' \
    -d @- <<JSON
{
  "type": "regular",
  "recipients": {"list_id": "${LIST_ID}"},
  "settings": {
    "subject_line": "${subject}",
    "title": "${title}",
    "from_name": "Mahjong Mastery",
    "reply_to": "winningatmahjong@gmail.com"
  }
}
JSON
  )

  local id
  id=$(node -e "try{const r=JSON.parse(process.argv[1]); console.log(r.id||'');}catch(e){console.log('');}" "$resp")

  if [[ -z "$id" ]]; then
    echo "Failed to create campaign: $title"
    echo "$resp"
    return 1
  fi

  # Set content
  curl -sS -u "$AUTH" -X PUT "${BASE}/campaigns/${id}/content" \
    -H 'Content-Type: application/json' \
    -d @- <<JSON
{
  "html": ${html}
}
JSON

  echo "Created campaign $title with id $id"
}

json_escape() {
  node -e "const fs=require('fs'); const html=fs.readFileSync(0,'utf8'); console.log(JSON.stringify(html));"
}

html1=$(cat <<'HTML' | json_escape
<html><body style='font-family: Arial, sans-serif; color:#222;'>
<p>Hey there — welcome to <strong>Mahjong Mastery</strong> at <a href='https://winningatmahjong.shop'>winningatmahjong.shop</a>! I’m so glad you’re here.</p>
<p>Your free tile guide is ready: <a href='https://winningatmahjong.shop/courses/free-tile-guide.html'>Get the guide</a>.</p>
<p>In the guide you’ll learn how to quickly recognize suits, honors, and the “why” behind strong hands. I also introduce my FAST framework so you can make confident choices faster.</p>
<p><a href='https://winningatmahjong.shop/courses/free-tile-guide.html'>Read your free guide now</a> 🀄</p>
<p>— The Mahjong Mastery team at winningatmahjong.shop</p>
<p><small>Unsubscribe: *|UNSUB|*</small></p>
</body></html>
HTML
)

html2=$(cat <<'HTML' | json_escape
<html><body style='font-family: Arial, sans-serif; color:#222;'>
<p>Quick question: do you decide on a hand too late? That’s the #1 mistake I see from losing players.</p>
<p>If you wait too long to commit, you miss easy tiles and fall into “almost” hands. In Mahjong 101, I show you how to spot the best path early and stick to it.</p>
<p><a href='https://winningatmahjong.shop/#mahjong-101'>Learn the fix in Mahjong 101 ($37)</a></p>
<p>— The Mahjong Mastery team at winningatmahjong.shop</p>
<p><small>Unsubscribe: *|UNSUB|*</small></p>
</body></html>
HTML
)

html3=$(cat <<'HTML' | json_escape
<html><body style='font-family: Arial, sans-serif; color:#222;'>
<p>Here are 5 quick wins you can use right away:</p>
<ol>
<li>Pick a hand by turn 4–5.</li>
<li>Track 1 suit to know what’s “live.”</li>
<li>Keep pairs early; they’re flexibility.</li>
<li>Watch discards for safety clues.</li>
<li>Count remaining tiles before chasing.</li>
</ol>
<p>These are pulled from the Winning Quick guide, and they make a real difference. If you want the full playbook, it’s waiting for you.</p>
<p><a href='https://winningatmahjong.shop/#winning-quick'>Get the full Winning Quick guide ($27)</a></p>
<p>— The Mahjong Mastery team at winningatmahjong.shop</p>
<p><small>Unsubscribe: *|UNSUB|*</small></p>
</body></html>
HTML
)

html4=$(cat <<'HTML' | json_escape
<html><body style='font-family: Arial, sans-serif; color:#222;'>
<p>“I used to dread game night because I always felt behind.” That’s what Lisa told me before she joined Mahjong 101.</p>
<p>Two weeks later she was calling her hand early, playing with confidence, and winning consistently. That can be you too.</p>
<p><a href='https://winningatmahjong.shop/#mahjong-101'>Start with Mahjong 101 ($37)</a></p>
<p>— The Mahjong Mastery team at winningatmahjong.shop</p>
<p><small>Unsubscribe: *|UNSUB|*</small></p>
</body></html>
HTML
)

html5=$(cat <<'HTML' | json_escape
<html><body style='font-family: Arial, sans-serif; color:#222;'>
<p>Quick quiz — which player are you today?</p>
<p><strong>Beginner:</strong> You’re still learning tiles and hand patterns → Start with <a href='https://winningatmahjong.shop/#mahjong-101'>Mahjong 101 ($37)</a></p>
<p><strong>Intermediate:</strong> You know the basics but want faster, smarter wins → Grab <a href='https://winningatmahjong.shop/#winning-quick'>Winning Quick ($27)</a></p>
<p><strong>Advanced:</strong> You want deeper strategy and consistent control → Step into <a href='https://winningatmahjong.shop/courses/mahjong-mastery.html'>Mahjong Mastery (full course)</a></p>
<p>Pick your path now so your next game feels calm and confident. Spots and energy are always limited — don’t wait too long.</p>
<p>— The Mahjong Mastery team at winningatmahjong.shop</p>
<p><small>Unsubscribe: *|UNSUB|*</small></p>
</body></html>
HTML
)

create_campaign "MM Welcome 1" "Your Mahjong Tile Guide is ready 🀄" "$html1"
create_campaign "MM Welcome 2" "Are you making this Mahjong mistake?" "$html2"
create_campaign "MM Welcome 3" "Try these 5 tips at your next Mahjong game" "$html3"
create_campaign "MM Welcome 4" "I used to dread game night..." "$html4"
create_campaign "MM Welcome 5" "Which Mahjong player are you?" "$html5"
