import { color } from "console-log-colors";
import cors from "cors";
import { CronJob } from "cron";
import dotenv from "dotenv";
import express from "express";
import connectDatabase from "./config/db.config";
import { createResponse } from "./middlewares/error/CreateResponse";
import routers from "./routes/index";
import statisticsService from "./services/statistics.service";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
connectDatabase();
app.use(cors());
app.use(express.json());
app.use("/api", routers);
app.use((err: Error, req: express.Request, res: express.Response): void => {
  console.log(
    color.bgRed(`Error: ${err.name} - ${err.message} - ${res.statusMessage}`)
  );
  res
    .status(500)
    .json(createResponse(null, false, `Error: ${err.message || err}`));
});

const dailyStatisticsUpdateJob = new CronJob(
  "0 0 * * *",
  async function () {
    console.log("Starting daily update process...", new Date());
    try {
      const result = await statisticsService.updateStatisticsService();
      console.log("Daily update completed:", result);
    } catch (error) {
      console.error("Error during daily update:", error);
    }
  },
  null,
  true,
  "Europe/Istanbul"
);

dailyStatisticsUpdateJob.start();

// app.use(errorHandler);
app.listen(PORT, () => {
  console.log(color.bgCyan(`Server is running on port ${PORT}...`));
});
