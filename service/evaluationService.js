const {findOptionChain} = require("../repository/optionChainRepository")

async function evaluate(req) {
    try {
    const { userSelections, totalLotMultiplier, date, index } = req.body;

    const snapshots = await findOptionChain(date, index);
    const result = evaluateUserSelections(snapshots, userSelections, totalLotMultiplier);

    return result;
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


function groupSnapshotsByStrike(snapshots) {
  const map = {};

  for (const snap of snapshots) {
    const key = snap.strikePrice;

    if (!map[key]) {
      map[key] = [];
    }

    map[key].push(snap);
  }

  // Sort each group by scrappingTimeValue
  for (const key in map) {
    map[key].sort((a, b) => a.scrappingTimeValue - b.scrappingTimeValue);
  }

  return map;
}

function normalizeUserSelections(selections, totalLotMultiplier) {
  return selections.map(sel => ({
    ...sel,
    lotSize: sel.lotSize ?? totalLotMultiplier ?? 1
  }));
}

function calculatePnL(base, current, type, position, lotSize) {
  const basePremium = base[type];
  const currentPremium = current[type];
  const baseIndex = base.indexPrice;
  const currentIndex = current.indexPrice;
  const currentTime = current.scrappingTimeValue;

  let buyPrice, sellPrice;

  if (position === "BUY") {
    buyPrice = basePremium;
    sellPrice = currentPremium;
  } else {
    sellPrice = basePremium;
    buyPrice = currentPremium;
  }

  const rawPnL = sellPrice - buyPrice;
  const pnl = rawPnL * lotSize;

  const indexMove =
    baseIndex && currentIndex
      ? ((currentIndex - baseIndex) / baseIndex) * 100
      : 0;

  return {
    time: current.scrappingTime,
    buyPrice,
    sellPrice,
    lotSize,
    lotMultiplier: lotSize,
    currentTime,
    indexMovementPercent: parseFloat(indexMove.toFixed(2)),
    pnl: parseFloat(pnl.toFixed(2)),
    result: pnl > 0 ? "Profit" : pnl < 0 ? "Loss" : "No Change"
  };
}


function evaluateUserSelections(snapshots, userSelections, totalLotMultiplier) {
  const grouped = groupSnapshotsByStrike(snapshots);
  const selections = normalizeUserSelections(userSelections, totalLotMultiplier);
  const timeMap = {};
  const detailed = [];

  for (const selection of selections) {
    const { strikePrice, type, position, lotSize } = selection;
    const snapshotGroup = grouped[strikePrice];
    if (!snapshotGroup || snapshotGroup.length === 0) continue;

    const base = snapshotGroup[0];

    const comparisons = snapshotGroup.map(snap => {
      const pnlObj = calculatePnL(base, snap, type, position, lotSize);
      const t = pnlObj.time;
      if (!timeMap[t]) timeMap[t] = { totalPnL: 0, totalBuyPrice: 0, totalSellPrice: 0 };

      timeMap[t].totalPnL += pnlObj.pnl;
      timeMap[t].totalBuyPrice += pnlObj.buyPrice * pnlObj.lotSize;
      timeMap[t].totalSellPrice += pnlObj.sellPrice * pnlObj.lotSize;

      return pnlObj;
    });

    detailed.push({
      strikePrice,
      type,
      position,
      lotSize,
      comparisons
    });
  }

  const summary = Object.entries(timeMap).map(([time, vals]) => {
    const percent =
      vals.totalBuyPrice === 0 ? 0 :
      ((vals.totalSellPrice - vals.totalBuyPrice) / vals.totalBuyPrice) * 100;

    return {
      time,
      totalBuyPrice: parseFloat(vals.totalBuyPrice.toFixed(2)),
      totalSellPrice: parseFloat(vals.totalSellPrice.toFixed(2)),
      totalPnL: parseFloat(vals.totalPnL.toFixed(2)),
      profitLossPercent: parseFloat(percent.toFixed(2)),
      result:
        vals.totalPnL > 0 ? "Profit" :
        vals.totalPnL < 0 ? "Loss" :
        "No Change"
    };
  }).sort((a, b) =>
    new Date(`01/01/2000 ${a.time}`) - new Date(`01/01/2000 ${b.time}`)
  );

  const combinedBuy = summary.reduce((sum, row) => sum + row.totalBuyPrice, 0);
  const combinedSell = summary.reduce((sum, row) => sum + row.totalSellPrice, 0);
  const combinedPnL = combinedSell - combinedBuy;
  const combinedPercent =
    combinedBuy === 0 ? 0 : ((combinedPnL) / combinedBuy) * 100;

  const combinedSummary = {
    totalBuyPrice: parseFloat(combinedBuy.toFixed(2)),
    totalSellPrice: parseFloat(combinedSell.toFixed(2)),
    totalPnL: parseFloat(combinedPnL.toFixed(2)),
    profitLossPercent: parseFloat(combinedPercent.toFixed(2)),
    result:
      combinedPnL > 0 ? "Profit" :
      combinedPnL < 0 ? "Loss" :
      "No Change"
  };

  return { detailed, summary, combinedSummary };
}

module.exports = {
  evaluate
};

// 📬 Sample POST Request
// Send to http://localhost:3000/evaluate:
// json
// CopyEdit
// {
//   "userSelections": [
//     { "strikePrice": 22000, "type": "PE", "position": "BUY" },
//     { "strikePrice": 22300, "type": "CE", "position": "BUY" }
//   ],
//   "totalLotMultiplier": 2
// }