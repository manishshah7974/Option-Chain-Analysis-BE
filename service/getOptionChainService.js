const puppeteer = require("puppeteer");
const { extractOptionChain } = require("./processOptionDataService");
const { insertOptionChainData } = require("./mongoInsertService");
const {getOptionChainData} = require("../repository/optionChainRepository")

async function fetchNSEOptionChain({
  symbol = "NIFTY",
  expiry = "31-Jul-2025",
  targetStrike = 25000,
  expiryList = ["31-Jul-2025"],
  range = 2000,
  interval = 50,
}) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set a valid user-agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );

  // Step 1: Load the NSE homepage to establish session and cookies
  await page.goto("https://www.nseindia.com", {
    waitUntil: "domcontentloaded",
  });

  // Wait a bit to ensure cookies/session are set
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Step 2: Set extra headers
  await page.setExtraHTTPHeaders({
    accept: "application/json",
    referer: "https://www.nseindia.com/option-chain",
    "x-requested-with": "XMLHttpRequest",
  });

  // Step 3: Request the actual data
  const url = `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}&expiry=${expiry}`;
  const response = await page.goto(url, { waitUntil: "networkidle2" });

  const contentType = response.headers()["content-type"];
  const bodyText = await response.text();

  // Check if JSON is received
  if (!contentType.includes("application/json")) {
    throw new Error("Did not receive JSON. Possibly blocked by NSE.");
  }

  const jsonData = JSON.parse(bodyText);

  await browser.close();

  const results = extractOptionChain(
    jsonData,
    targetStrike,
    expiryList,
    range,
    interval
  );

  await insertOptionChainData(results);
  return jsonData;
  // return "Data added in mongo";
}

async function getOptionChainFromDB(date, index, time) {
    try {
    const result = await getOptionChainData(date, index, Number(time));

    return result;
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  fetchNSEOptionChain,
  getOptionChainFromDB
};
