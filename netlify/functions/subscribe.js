const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const email = (body.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Valid email required" }),
      };
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID || "1cc11f7750";
    const server = process.env.MAILCHIMP_SERVER || "us13";

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: "Mailchimp API key missing" }),
      };
    }

    const endpoint = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`;
    const auth = Buffer.from(`anystring:${apiKey}`).toString("base64");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
      }),
    });

    if (response.ok) {
      // Send welcome email asynchronously (don't block on it)
      fetch(`${process.env.URL || 'https://winningatmahjong.shop'}/.netlify/functions/send-welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }).catch(err => console.error('Welcome email failed:', err));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    const data = await response.json().catch(() => ({}));
    const message = data.detail || data.title || "Mailchimp error";

    if (
      response.status === 400 &&
      (data.title === "Member Exists" || /already a list member/i.test(message))
    ) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    console.error("Mailchimp subscribe error:", data);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: message }),
    };
  } catch (error) {
    console.error("Subscribe error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "Server error" }),
    };
  }
};
