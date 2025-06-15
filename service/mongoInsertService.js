const { getDb } = require("../db/mongoClient");

async function insertOptionChainData(data = []) {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("No data provided for insertion");
    return;
  }

  try {
    const db = await getDb();
    const collection = db.collection("option_chain"); // Use your actual collection name

    const result = await collection.insertMany(data);
    console.log(`Inserted ${result.insertedCount} documents into option_chain`);
    return result;
  } catch (error) {
    console.error("Error inserting option chain data:", error);
    throw error;
  }
}

module.exports = {
  insertOptionChainData,
};
