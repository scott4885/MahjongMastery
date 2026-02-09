#!/usr/bin/env node
// Email drip sequence automation
// Checks Mailchimp subscribers and sends follow-up emails based on signup date

const https = require('https');

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER || 'us13';
const LIST_ID = process.env.MAILCHIMP_LIST_ID || '1cc11f7750';

if (!MAILCHIMP_API_KEY) {
  console.error('MAILCHIMP_API_KEY not set');
  process.exit(1);
}

const auth = Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64');

// Email sequence (days after signup)
const SEQUENCE = [
  { day: 2, subject: "Are you making this Mahjong mistake?", campaign_id: "e303248a8d" },
  { day: 5, subject: "The secret to reading your opponents", campaign_id: "ef53ae17ee" },
  { day: 7, subject: "Why you keep getting stuck mid-game", campaign_id: "07d7c57a46" },
  { day: 14, subject: "Last chance: Your course bundle discount", campaign_id: "71c2d319c3" }
];

async function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${MAILCHIMP_SERVER}.api.mailchimp.com`,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`API error ${res.statusCode}: ${parsed.detail || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getSubscribers() {
  const data = await apiRequest(`/3.0/lists/${LIST_ID}/members?count=1000&status=subscribed`);
  return data.members || [];
}

async function sendCampaignToSubscriber(campaignId, email, subject) {
  try {
    // Clone the draft campaign for this specific subscriber
    const segmentCampaign = {
      type: 'regular',
      recipients: {
        list_id: LIST_ID,
        segment_opts: {
          match: 'all',
          conditions: [{
            condition_type: 'EmailAddress',
            field: 'EMAIL',
            op: 'is',
            value: email
          }]
        }
      },
      settings: {
        subject_line: subject,
        from_name: 'Mahjong Mastery',
        reply_to: 'support@winningatmahjong.shop',
        title: `Drip Day ${subject.substring(0, 20)} - ${email}`
      }
    };

    // Get campaign content from template
    const templateContent = await apiRequest(`/3.0/campaigns/${campaignId}/content`);
    
    // Create new campaign
    const newCampaign = await apiRequest('/3.0/campaigns', 'POST', segmentCampaign);
    
    // Set content
    await apiRequest(`/3.0/campaigns/${newCampaign.id}/content`, 'PUT', {
      html: templateContent.html
    });
    
    // Send
    await apiRequest(`/3.0/campaigns/${newCampaign.id}/actions/send`, 'POST');
    
    console.log(`✅ Sent email to ${email}: ${subject}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send to ${email}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Checking drip sequence...');
  
  const subscribers = await getSubscribers();
  console.log(`📧 Found ${subscribers.length} subscribers`);
  
  const now = new Date();
  let sent = 0;
  
  for (const subscriber of subscribers) {
    const email = subscriber.email_address;
    const signupDate = new Date(subscriber.timestamp_opt);
    const daysSince = Math.floor((now - signupDate) / (1000 * 60 * 60 * 24));
    
    // Check tags to see which emails have been sent
    const tags = subscriber.tags?.map(t => t.name) || [];
    
    for (const step of SEQUENCE) {
      const tagName = `drip-day-${step.day}`;
      
      // If it's time to send this email and we haven't sent it yet
      if (daysSince >= step.day && !tags.includes(tagName)) {
        console.log(`📤 Sending day ${step.day} email to ${email} (signed up ${daysSince} days ago)`);
        
        const success = await sendCampaignToSubscriber(step.campaign_id, email, step.subject);
        
        if (success) {
          // Tag the subscriber so we don't send again
          await apiRequest(`/3.0/lists/${LIST_ID}/members/${subscriber.id}/tags`, 'POST', {
            tags: [{ name: tagName, status: 'active' }]
          });
          sent++;
        }
      }
    }
  }
  
  console.log(`✅ Drip check complete. Sent ${sent} emails.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
