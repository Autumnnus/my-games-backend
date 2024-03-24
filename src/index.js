const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes/auth");
const connectDatabase = require("./db/conn");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
connectDatabase();

app.use(express.json());

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
