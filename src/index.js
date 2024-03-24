const express = require("express");
const dotenv = require("dotenv");
const connectDatabase = require("./db/conn");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
connectDatabase();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${  PORT  }...`);
});
