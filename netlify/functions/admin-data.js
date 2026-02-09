const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "netlify", "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

const safeRead = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw || "[]");
  } catch (error) {
    return [];
  }
};

exports.handler = async () => {
  const subscribers = safeRead(SUBSCRIBERS_FILE);
  const purchases = safeRead(PURCHASES_FILE);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({
      subscribers,
      purchases,
    }),
  };
};
