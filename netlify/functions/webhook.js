const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Stripe = require("stripe");

const DATA_DIR = path.join(process.cwd(), "netlify", "data");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

const PRICE_CATALOG = {
  price_1SygxcRRTP7OHPOJud7HmdBx: {
    name: "Mahjong 101",
    url: "https://winningatmahjong.shop/courses/dl/mahjong-101.html",
  },
  price_1SygxdRRTP7OHPOJtWhUkiUn: {
    name: "Winning Quick",
    url: "https://winningatmahjong.shop/courses/dl/winning-quick.html",
  },
  price_1SygxcRRTP7OHPOJhJBZ0MPO: {
    name: "Mahjong 201",
    url: "https://winningatmahjong.shop/courses/dl/mahjong-201.html",
  },
  price_1SygxdRRTP7OHPOJ16akmk8d: {
    name: "Mahjong 301",
    url: "https://winningatmahjong.shop/courses/dl/mahjong-301.html",
  },
  price_free_tile_guide: {
    name: "Free Tile Guide",
    url: "https://winningatmahjong.shop/courses/free-tile-guide.html",
  },
  price_bundle_all_courses: {
    name: "All Courses Bundle",
    bundle: true,
  },
};

const BUNDLE_ITEMS = [
  PRICE_CATALOG.price_1SygxcRRTP7OHPOJud7HmdBx,
  PRICE_CATALOG.price_1SygxdRRTP7OHPOJtWhUkiUn,
  PRICE_CATALOG.price_1SygxcRRTP7OHPOJhJBZ0MPO,
  PRICE_CATALOG.price_1SygxdRRTP7OHPOJ16akmk8d,
];

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PURCHASES_FILE)) {
    fs.writeFileSync(PURCHASES_FILE, JSON.stringify([]));
  }
};

const readPurchases = () => {
  ensureDataFile();
  const raw = fs.readFileSync(PURCHASES_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

const writePurchases = (purchases) => {
  fs.writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2));
};

const buildDeliveryItems = (lineItems = []) => {
  const items = [];
  lineItems.forEach((item) => {
    const priceId = item.price?.id;
    const catalogItem = PRICE_CATALOG[priceId];
    if (!catalogItem) {
      return;
    }

    if (catalogItem.bundle) {
      BUNDLE_ITEMS.forEach((bundleItem) => {
        if (bundleItem) items.push(bundleItem);
      });
      return;
    }

    items.push(catalogItem);
  });

  const unique = new Map();
  items.forEach((item) => {
    if (item?.url) unique.set(item.url, item);
  });
  return Array.from(unique.values());
};

const sendPurchaseEmail = async ({ email, items, sessionId }) => {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID || "1cc11f7750";
  const server = process.env.MAILCHIMP_SERVER || "us13";

  if (!apiKey) {
    console.warn("MAILCHIMP_API_KEY missing; skipping purchase email.");
    return;
  }

  const auth = Buffer.from(`anystring:${apiKey}`).toString("base64");
  const subscriberHash = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");

  // Upsert subscriber to allow transactional-style campaign send
  await fetch(`https://${server}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      email_address: email,
      status_if_new: "subscribed",
      status: "subscribed",
      tags: ["customer"],
    }),
  });

  const campaignData = {
    type: "regular",
    recipients: {
      list_id: listId,
      segment_opts: {
        match: "all",
        conditions: [
          {
            condition_type: "EmailAddress",
            field: "EMAIL",
            op: "is",
            value: email,
          },
        ],
      },
    },
    settings: {
      subject_line: "Your Mahjong Mastery download is ready 🀄",
      from_name: "Mahjong Mastery",
      reply_to: "winningatmahjong@gmail.com",
      title: `Purchase delivery - ${sessionId}`,
      inline_css: true,
    },
  };

  const createRes = await fetch(`https://${server}.api.mailchimp.com/3.0/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(campaignData),
  });

  if (!createRes.ok) {
    console.error("Purchase campaign create error:", await createRes.json());
    return;
  }

  const campaign = await createRes.json();
  const campaignId = campaign.id;

  const itemList = items
    .map(
      (item) =>
        `<li><a href="${item.url}" style="color:#8B5A5F;font-weight:600;">${item.name}</a></li>`
    )
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #8B5A5F; font-size: 24px; }
    a { color: #8B5A5F; text-decoration: none; }
    .cta { display: inline-block; background: #8B5A5F; color: white !important; padding: 12px 24px; border-radius: 6px; margin: 16px 0; }
    .footer { font-size: 12px; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <h1>Your Mahjong Mastery downloads are ready! 🀄</h1>
  <p>Thanks again for your purchase. Here are your downloads:</p>
  <ul>${itemList}</ul>
  <p>If you prefer PDFs, reply to this email and we’ll send printable versions.</p>
  <p>Questions? Just reply — we’re happy to help.</p>
  <div class="footer">
    <p>Mahjong Mastery • <a href="https://winningatmahjong.shop">winningatmahjong.shop</a></p>
    <p><a href="*|UNSUB|*">Unsubscribe</a></p>
  </div>
</body>
</html>
  `;

  const contentRes = await fetch(
    `https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ html: htmlContent }),
    }
  );

  if (!contentRes.ok) {
    console.error("Purchase content set error:", await contentRes.json());
    return;
  }

  const sendRes = await fetch(
    `https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  if (!sendRes.ok) {
    console.error("Purchase send error:", await sendRes.json());
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = event.headers["stripe-signature"];

  try {
    let stripeEvent;
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body || "";

    if (stripeKey && webhookSecret && signature) {
      const stripe = new Stripe(stripeKey);
      stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      stripeEvent = JSON.parse(rawBody || "{}");
    }

    const eventType = stripeEvent.type;

    if (eventType === "checkout.session.completed") {
      const session = stripeEvent.data?.object || {};
      const purchases = readPurchases();

      purchases.unshift({
        id: session.id,
        customerEmail: session.customer_details?.email || session.customer_email || null,
        amountTotal: session.amount_total || null,
        currency: session.currency || null,
        paymentStatus: session.payment_status || null,
        createdAt: new Date().toISOString(),
      });

      writePurchases(purchases.slice(0, 100));
      console.log("Recorded purchase:", session.id);

      const customerEmail = session.customer_details?.email || session.customer_email;
      if (stripeKey && customerEmail) {
        const stripe = new Stripe(stripeKey);
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
        const items = buildDeliveryItems(lineItems.data || []);

        if (items.length) {
          await sendPurchaseEmail({ email: customerEmail, items, sessionId: session.id });
        } else {
          console.warn("No delivery items found for session", session.id);
        }
      }
    }

    return { statusCode: 200, body: "ok" };
  } catch (error) {
    console.error("Webhook error:", error);
    return { statusCode: 200, body: "ok" };
  }
};
