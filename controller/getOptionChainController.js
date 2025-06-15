const { fetchNSEOptionChain, getOptionChainFromDB } = require("../service/getOptionChainService");
const { evaluate} = require("../service/evaluationService");

const getOptionChain = async (req, res) => {
  try {
    const results = await fetchNSEOptionChain({
      symbol: "NIFTY",
      expiry: "31-Jul-2025",
      targetStrike: 25000,
      expiryList: ["31-Jul-2025"],
      range: 2000,
      interval: 50,
    });

    res.json(results);
  } catch (error) {
    console.error("Failed to fetch option chain:", error);
    res.status(500).json({ error: "Failed to fetch option chain" });
  }
};

const evaluateChain = async (req, res) => {
  try {
    const result = await evaluate(req);
    res.json(result);
  } catch (error) {
    console.error("Failed to fetch evaluateChain:", error);
    res.status(500).json({ error: "Failed to fetch evaluateChain" });
  }
}

const getOptionChainData = async (req, res) => {
  try {
    const {date, index, time} = req.query;
    const result = await getOptionChainFromDB(date, index, time);
    res.json(result);
  } catch (error) {
    console.error("Failed to fetch evaluateChain:", error);
    res.status(500).json({ error: "Failed to fetch evaluateChain" });
  }
}

module.exports = { getOptionChain, evaluateChain, getOptionChainData };
