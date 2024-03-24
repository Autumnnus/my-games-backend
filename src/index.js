const express = require("express");
const routes = require("./routes/auth");
const connectDatabase = require("./db/conn");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
connectDatabase();

app.use(express.json());

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
