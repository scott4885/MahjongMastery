const Stripe = require("stripe");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { priceId } = JSON.parse(event.body || "{}");

    if (!priceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "priceId is required" }),
      };
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Stripe secret key missing" }),
      };
    }

    const stripe = new Stripe(stripeKey);
    const origin = event.headers.origin || "https://mahjongmastery.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success.html`,
      cancel_url: `${origin}/`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error("Create checkout session error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
