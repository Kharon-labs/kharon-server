const fs = require("fs");
const path = require("path");
const app = require("./app");
const https = require("https");
const cookieSession = require("cookie-session");
const passport = require("./Auth/auth");
const authRoutes = require("./Auth/routes.auth");
const { mongoConnect } = require('./Services/mongo');

require("dotenv").config();
require("express-async-errors");

const PORT = process.env.PORT || 3000;

app.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2],
  })
);

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
