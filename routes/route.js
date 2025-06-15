const express = require("express");
const { getOptionChain, evaluateChain, getOptionChainData } = require("../controller/getOptionChainController");

const router = express.Router();

router.get("/v1/option-chain", getOptionChain);
router.get("/v1/option-chain-data", getOptionChainData);
router.post("/v1/evaluate", evaluateChain);

module.exports = router;
