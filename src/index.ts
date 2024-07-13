import cors from "cors";
import express from "express";
import connectDatabase from "./db/conn";
import errorHandler from "./middlewares/error/ErrorHandler";
import routers from "./routes/index";
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
connectDatabase();
app.use(cors());
app.use(express.json());

app.use("/api", routers);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
