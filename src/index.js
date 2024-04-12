const express = require("express");
const routers = require("./routes/index");
const connectDatabase = require("./db/conn");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
connectDatabase();
app.use(cors());
app.use(express.json());

app.use("/api", routers);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
