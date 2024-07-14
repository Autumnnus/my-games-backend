import { color } from "console-log-colors";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDatabase from "./db/conn";
import errorHandler from "./middlewares/error/ErrorHandler";
import routers from "./routes/index";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
connectDatabase();
app.use(cors());
app.use(express.json());
app.use("/api", routers);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(color.bgCyan(`Server is running on port ${PORT}...`));
});
