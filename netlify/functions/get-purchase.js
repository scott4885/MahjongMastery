// get-purchase.js — Retrieve download links for a completed Stripe checkout session
// Called from success.html?session_id=xxx

const Stripe = require("stripe");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

const PRICE_CATALOG = {
  price_1SygxcRRTP7OHPOJud7HmdBx: { name: "Mahjong 101", url: "/courses/dl/mahjong-101.html" },
  price_1SygxdRRTP7OHPOJtWhUkiUn: { name: "Winning Quick", url: "/courses/dl/winning-quick.html" },
  price_1SygxcRRTP7OHPOJhJBZ0MPO: { name: "Mahjong 201", url: "/courses/dl/mahjong-201.html" },
  price_1SygxdRRTP7OHPOJ16akmk8d: { name: "Mahjong 301", url: "/courses/dl/mahjong-301.html" },
  price_1T7n4GRRTP7OHPOJy1FnTDuZ: { name: "All Courses Bundle", bundle: true },
};

const BUNDLE_URLS = [
  { name: "Mahjong 101", url: "/courses/dl/mahjong-101.html" },
  { name: "Winning Quick", url: "/courses/dl/winning-quick.html" },
  { name: "Mahjong 201", url: "/courses/dl/mahjong-201.html" },
  { name: "Mahjong 301", url: "/courses/dl/mahjong-301.html" },
];

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const sessionId = event.queryStringParameters?.session_id;

  if (!sessionId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "session_id required" }) };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server configuration error" }) };
  }

  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { statusCode: 402, headers, body: JSON.stringify({ error: "Payment not completed" }) };
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });

    const downloads = [];
    lineItems.data.forEach((item) => {
      const priceId = item.price?.id;
      const catalogItem = PRICE_CATALOG[priceId];
      if (!catalogItem) return;
      if (catalogItem.bundle) {
        BUNDLE_URLS.forEach((b) => downloads.push(b));
        return;
      }
      downloads.push(catalogItem);
    });

    const seen = new Set();
    const unique = downloads.filter((d) => {
      if (seen.has(d.url)) return false;
      seen.add(d.url);
      return true;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        email: session.customer_details?.email || "",
        downloads: unique,
      }),
    };
  } catch (error) {
    console.error("get-purchase error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Could not retrieve purchase" }) };
  }
};
