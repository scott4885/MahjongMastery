// Sends welcome email immediately after subscription
// Called internally by subscribe.js

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || "{}");
    
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email required" }),
      };
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID || "1cc11f7750";
    const server = process.env.MAILCHIMP_SERVER || "us13";

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Mailchimp API key missing" }),
      };
    }

    const auth = Buffer.from(`anystring:${apiKey}`).toString("base64");

    // Create a one-time campaign for this subscriber
    const campaignData = {
      type: "regular",
      recipients: {
        list_id: listId,
        segment_opts: {
          match: "all",
          conditions: [{
            condition_type: "EmailAddress",
            field: "EMAIL",
            op: "is",
            value: email
          }]
        }
      },
      settings: {
        subject_line: "Your Mahjong Tile Guide is ready 🀄",
        from_name: "Mahjong Mastery",
        reply_to: "support@winningatmahjong.shop",
        title: `Welcome - ${email}`,
        inline_css: true
      }
    };

    // Create campaign
    const createRes = await fetch(`https://${server}.api.mailchimp.com/3.0/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(campaignData),
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      console.error("Campaign create error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to create campaign" }),
      };
    }

    const campaign = await createRes.json();
    const campaignId = campaign.id;

    // Set content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #8B5A5F; font-size: 24px; }
    a { color: #8B5A5F; text-decoration: none; font-weight: 600; }
    .cta { display: inline-block; background: #8B5A5F; color: white !important; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
    .footer { font-size: 12px; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <h1>Your Free Tile Guide is Here! 🀄</h1>
  <p>Hey there — welcome to Mahjong Mastery! I'm so glad you're here.</p>
  <p>Your free tile guide is ready:</p>
  <p><a href="https://winningatmahjong.shop/courses/free-tile-guide.html" class="cta">Read Your Free Guide →</a></p>
  <p>In the guide you'll learn how to quickly recognize suits, honors, and the "why" behind strong hands. I also introduce my FAST framework so you can make confident choices faster.</p>
  <p>Questions? Just reply to this email — I read every one.</p>
  <p>— The Mahjong Mastery Team</p>
  <div class="footer">
    <p>Mahjong Mastery • <a href="https://winningatmahjong.shop">winningatmahjong.shop</a></p>
    <p><a href="*|UNSUB|*">Unsubscribe</a></p>
  </div>
</body>
</html>
    `;

    const contentRes = await fetch(`https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ html: htmlContent }),
    });

    if (!contentRes.ok) {
      console.error("Content set error:", await contentRes.json());
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to set content" }),
      };
    }

    // Send campaign
    const sendRes = await fetch(`https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!sendRes.ok) {
      console.error("Send error:", await sendRes.json());
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to send" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Welcome email error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
