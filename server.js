require("dotenv").config();
const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const errorHandling = require("./middleware/errorHandling");
const recruitNoticeApi = require("./routes/recruit-notice");

// global middleware
app.use(express.json());
app.use(cookieParser());

// api call middleware
app.use("/recruit-notice", recruitNoticeApi);

// error handling middleware
app.use(errorHandling());
module.exports = app;
