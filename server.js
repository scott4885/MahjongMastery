const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Stripe webhook MUST use raw body ───────────────────────────────────────
// Mount this BEFORE express.json() so the raw buffer is available.
const webhookHandler = require("./netlify/functions/webhook");

app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const event = {
      httpMethod: "POST",
      headers: req.headers,
      body: req.body ? req.body.toString("utf8") : "",
      isBase64Encoded: false,
    };
    const result = await webhookHandler.handler(event);
    res.status(result.statusCode || 200).send(result.body || "ok");
  }
);

// ─── JSON body parser for all other routes ──────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Helper: wrap a Netlify-style handler as an Express route ───────────────
const netlifyToExpress = (handler) => async (req, res) => {
  const body =
    req.body && typeof req.body === "object"
      ? JSON.stringify(req.body)
      : req.body || "";

  const event = {
    httpMethod: req.method,
    headers: req.headers,
    queryStringParameters: req.query,
    body,
    isBase64Encoded: false,
  };

  try {
    const result = await handler(event);
    const headers = result.headers || {};
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res
      .status(result.statusCode || 200)
      .send(result.body !== undefined ? result.body : "");
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── API routes ─────────────────────────────────────────────────────────────
const checkoutHandler = require("./netlify/functions/create-checkout-session");
const subscribeHandler = require("./netlify/functions/subscribe");
const adminDataHandler = require("./netlify/functions/admin-data");
const sendWelcomeHandler = require("./netlify/functions/send-welcome");

app.options("/api/*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.status(200).send("");
});

app.post("/api/create-checkout-session", netlifyToExpress(checkoutHandler.handler));
app.post("/api/subscribe", netlifyToExpress(subscribeHandler.handler));
app.get("/api/admin-data", netlifyToExpress(adminDataHandler.handler));
app.post("/api/send-welcome", netlifyToExpress(sendWelcomeHandler.handler));

// ─── Legacy Netlify function URLs (keep working just in case) ────────────────
app.post("/.netlify/functions/create-checkout-session", netlifyToExpress(checkoutHandler.handler));
app.post("/.netlify/functions/subscribe", netlifyToExpress(subscribeHandler.handler));
app.get("/.netlify/functions/admin-data", netlifyToExpress(adminDataHandler.handler));
app.post("/.netlify/functions/send-welcome", netlifyToExpress(sendWelcomeHandler.handler));
app.post("/.netlify/functions/webhook", netlifyToExpress(webhookHandler.handler));

// ─── Static files ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname), { index: "index.html" }));

// SPA fallback — but don't 404 on missing static assets
app.use((req, res, next) => {
  // Only serve index.html for HTML-seeking requests
  if (req.accepts("html") && !req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "index.html"));
  } else {
    next();
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`MahjongMastery server running on port ${PORT}`);
});

module.exports = app;
