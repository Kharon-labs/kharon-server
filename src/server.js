const fs = require("fs");
const path = require("path");
const app = require("./app");
const https = require("https");
const express = require("express");
const passport = require("passport");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const serverless = require('serverless-http');
const authRoutes = require("./Routes/routes.route");
const { mongoConnect } = require("./Services/mongo");

require("dotenv").config();
require("express-async-errors");

const PORT = process.env.PORT || 8081;
const SESSION_SECRET = process.env.SESSION_SECRET;
const MONGO_URL = process.env.MONGO_DB_URL;

require("./Auth/google.auth")(passport); // to load google oauth strategy

app.use(
  session({
    secret: SESSION_SECRET || "SecretKey",
    resave: false, 
    saveUninitialized: false, 
    store: MongoStore.create({
      mongoUrl: MONGO_URL, 
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 12, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"), (err) => {
    if (err) {
      console.log("Error serving file", err);
      res.status(500).send("Error serving file");
    }
  });
});

app.use("/user", authRoutes);

/*
const server = https.createServer(
  {
    // key: fs.readFileSync("key.pem"),
    // cert: fs.readFileSync("cert.pem"),
  },
  app
);
*/

async function startServer() {
  await mongoConnect();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });
}

startServer();

export const handler = serverless(app);
