const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_DB_URL;

mongoose.connection.once("open", () => {
    console.log("Mongo Database connected...");
  });
  
  mongoose.connection.on("error", (err) => {
    console.log(err);
  });

  
async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
};