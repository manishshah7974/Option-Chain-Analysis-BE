function getScrappingTimestamp() {
  const now = new Date();

  // Format for IST
  const optionsDate = { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' };
  const optionsTime = { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false };

  const scrappingDate = new Intl.DateTimeFormat('en-GB', optionsDate).format(now);
  const scrappingTime = new Intl.DateTimeFormat('en-US', optionsTime).format(now);

  return { scrappingDate, scrappingTime };
}


function extractOptionChain(jsonData, targetStrike, expiryList, range, interval) {
  if (!jsonData.records || !Array.isArray(jsonData.records.data)) {
    console.error('Invalid JSON structure: missing "records.data" array');
    return [];
  }

  const indexPrice = jsonData.records.index?.last ?? null; 

  const { scrappingDate, scrappingTime } = getScrappingTimestamp();

  const scrappingTimeValue = Number(scrappingTime);

  const strikeMin = targetStrike - range;
  const strikeMax = targetStrike + range;

  const validStrikes = new Set();
  for (let s = strikeMin; s <= strikeMax; s += interval) {
    validStrikes.add(s);
  }

  return jsonData.records.data
    .filter(
      (item) =>
        expiryList.includes(item.expiryDate) &&
        validStrikes.has(item.strikePrice)
    )
    .map((item) => ({
      index: "NIFTY",
      scrappingDate,
      scrappingTimeValue,
      indexPrice,
      strikePrice: item.strikePrice,
      expiryDate: item.expiryDate,
      CE: item.CE?.lastPrice ?? null,
      PE: item.PE?.lastPrice ?? null,
    }));
}

module.exports = {
  extractOptionChain,
};
