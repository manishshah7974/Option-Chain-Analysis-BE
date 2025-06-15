// mongoClient.js
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME; // Replace with your database name

let client;

// Function to connect to MongoDB
const connectToMongoDB = async () => {
  if (client && client.isConnected()) {
    console.log("Already connected to MongoDB");
    return client;
  }

  try {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    console.log("Successfully connected to MongoDB");
    return client;
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    throw err;
  }
};

// Function to get the database
const getDb = async () => {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("Successfully connected to MongoDB");
  }

  return client.db(dbName);
};

// Function to close the connection (optional, you can call it when your app shuts down)
const closeConnection = () => {
  if (client) {
    client.close();
    console.log("Connection closed");
  }
};

module.exports = {
  connectToMongoDB,
  getDb,
  closeConnection,
};
