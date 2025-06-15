const cron = require("node-cron");
const moment = require("moment-timezone");
const Holidays = require("date-holidays");
const { fetchNSEOptionChain } = require("../service/getOptionChainService");

const hd = new Holidays("IN"); // Add state if needed, e.g., ("IN", "MH")

function isValidTradingDay() {
  const today = new Date();
  const isWeekday = today.getDay() >= 1 && today.getDay() <= 5;
  const isHoliday = hd.isHoliday(today);
  return isWeekday && !isHoliday;
}

const runJob = async () => {
  const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
  console.log(`[${now}] Checking trading day status...`);

  if (!isValidTradingDay()) {
    console.log("❌ Skipping job: Non-trading day");
    return;
  }

  console.log("✅ Running option chain job...");

  try {
    const result = await fetchNSEOptionChain({
      symbol: "NIFTY",
      expiry: "31-Jul-2025",
      targetStrike: 25000,
      expiryList: ["31-Jul-2025"],
      range: 2000,
      interval: 50,
    });

    console.log("✅ Option Chain fetched:", result.length);
  } catch (error) {
    console.error("❌ Job failed:", error.message);
  }
};

// Schedule jobs in UTC, equivalent to IST (UTC+5:30)
const cronJobs = [
  { time: "52 3 * * 1-5", label: "09:22 AM IST" },
  { time: "30 5 * * 1-5", label: "11:00 AM IST" },
  { time: "30 7 * * 1-5", label: "01:00 PM IST" },
  { time: "0 10 * * 1-5", label: "03:30 PM IST" },
];

cronJobs.forEach(({ time, label }) => {
  cron.schedule(time, runJob, {
    timezone: "Asia/Kolkata",
  });
  console.log(`🕒 Scheduled job at ${label}`);
});
