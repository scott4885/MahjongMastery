const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "netlify", "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([]));
  }
};

const readSubscribers = () => {
  ensureDataFile();
  const raw = fs.readFileSync(SUBSCRIBERS_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

const writeSubscribers = (subscribers) => {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
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

    const subscribers = readSubscribers();
    const existing = subscribers.find((entry) => entry.email === email);

    if (!existing) {
      subscribers.push({
        email,
        source: body.source || "lead_form",
        createdAt: new Date().toISOString(),
      });
      writeSubscribers(subscribers);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
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
