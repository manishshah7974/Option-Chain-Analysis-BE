const { getDb } = require("../db/mongoClient");
const OPTION_CHAIN_COLLECTION = "option_chain";
const { ObjectId } = require("mongodb");

const findOptionChain = async (date, index) => {
  const db = await getDb();
  const collection = db.collection(OPTION_CHAIN_COLLECTION);

  const query = {
    scrappingDate: date,
    index: index
  };

  const result = await collection.find(query).toArray();

  return result;
};

const getOptionChainData = async (date, index, time) => {
  const db = await getDb();
  const collection = db.collection(OPTION_CHAIN_COLLECTION);

  const query = {
    scrappingDate: date,
    index: index,
    scrappingTimeValue : time
  };

  const result = await collection.find(query).toArray();

  return result;
};


// const addContactRequests = async (request) => {
//   const db = await getDb();
//   const collection = db.collection(CONTACT_COLLECTION); // use your actual collection
//   return collection.insertOne(request);
// };

// const countContactRequests = async () => {
//   const db = await getDb();
//   const collection = db.collection(CONTACT_COLLECTION); // use your actual collection
//   return collection.countDocuments();
// };

// const updateStatusContactRequest = async (id, newStatus) => {
//   const db = await getDb();
//   const collection = db.collection(CONTACT_COLLECTION);
//   return collection.findOneAndUpdate(
//     { _id: new ObjectId(id) },
//     { $set: { status: newStatus } },
//     { returnDocument: "after" }, // returns the updated document
//   );
// };

module.exports = {
  findOptionChain,
  getOptionChainData
};
