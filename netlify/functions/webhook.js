const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "netlify", "data");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

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

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const eventType = payload.type;

    if (eventType === "checkout.session.completed") {
      const session = payload.data?.object || {};
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
    }

    return { statusCode: 200, body: "ok" };
  } catch (error) {
    console.error("Webhook error:", error);
    return { statusCode: 200, body: "ok" };
  }
};
