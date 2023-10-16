require("dotenv").config();
const express = require('express')
const app = express()

// global middleware
app.use(express.json());
app.use(cookieParser());

// api call middleware

// error handling middleware

module.exports = app;
