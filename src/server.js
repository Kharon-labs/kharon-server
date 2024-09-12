require("dotenv").config();
require("express-async-errors");

const https = require("https");
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_DB_URL;

const app = require("./app");

const server = https.createServer(app);

const PORT = process.env.PORT || 3000;


mongoose.connection.once("open", () => {
  console.log("Mongo Database connected...");
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

async function startServer() {
  await mongoose.connect(MONGO_URL);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });
}

startServer();
