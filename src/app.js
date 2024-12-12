const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

let clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

const app = express();
app.use(helmet());

let corsOptions = {
  origin: clientUrl,
};


app.use(
  cors({
    origin: clientUrl,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Content-Type-Options",
      "Accept",
      "X-Requested-With",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
      "token",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/api/v1/auth", require("./Routes/auth.route"));
app.use("/api/v1", require("./Routes/routes.route"));

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  console.log(error);
  console.log(`${req.method}, ${req.url}`);
  res.status(statusCode).json({ error: error.message });
});

module.exports = app;
