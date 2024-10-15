const fs = require("fs");
const path = require("path");
const app = require("./app");
const https = require("https");
const passport = require('passport');
const authRoutes = require("./Auth/routes.auth");
const { mongoConnect } = require('./Services/mongo');
const session = require("express-session");
const mongoDBSession = require('connect-mongodb-session')(session);
const MongoStore = require('connect-mongo');

require('./Auth/google.auth'); // to load google oauth strategy
require('./Auth/local.auth'); // to load local users strategy

require("dotenv").config();
require("express-async-errors");

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_DB_URL;

// const store = MongoStore.create({
//   mongoUrl: MONGO_URL,
//   collectionName: "sessions",
//   ttl: 60 * 60 * 12, // session lives only for 12 hours
// });

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URL,
    ttl: 60 * 60 * 12,
  }),
  cookie: {
    httpOnly: true,
    maxAge: 60 * 60 * 12 * 1000,
    secure: false,
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// app.use(express.static(path.join(__dirname, "public")));
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"), (err) => {
    if (err) {
      console.log("Error serving file", err);
      res.status(500).send("Error serving file");
    }
  });
});

const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);

async function startServer() {
  await mongoConnect();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });
}

startServer();
