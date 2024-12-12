const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
require('dotenv').config();

let clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

const app = express();
app.use(helmet());

let corsOptions = {
    origin: clientUrl,
}

app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        clientUrl
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Private-Network", true);
    res.setHeader("Access-Control-Max-Age", 7200);

    next();
});

// app.use(cors(corsOptions));

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