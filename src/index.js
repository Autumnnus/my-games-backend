const express = require("express");
const routers = require("./routes/index");
const connectDatabase = require("./db/conn");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
connectDatabase();
app.use(cors());
app.use(express.json());

app.use("/api", routers);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
