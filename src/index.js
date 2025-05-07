import express from "express";
import { App } from "./express-app.js";
import { connectionDB } from "./databases/connectionDB.js";
import dotEnv from "dotenv";
import { QueryAnalyzer } from "./databases/repository/queryAnalyzer.js";
dotEnv.config();
const analyzer = new QueryAnalyzer();
// setInterval(() => {
//   const memUsage = process.memoryUsage();
//   const cpuUsage = process.cpuUsage();

//   console.log(`--- Resource Usage ---`);
//   console.log(`RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
//   console.log(`Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
//   console.log(
//     `CPU Time: User ${cpuUsage.user / 1000}ms, System ${
//       cpuUsage.system / 1000
//     }ms`
//   );
//   console.log("----------------------\n");
// }, 5000); // every 5s

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";
const startServer = async () => {
  await analyzer.analyze(async () => {
    const app = express();
    await App(app); // Initialize your app

    app.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
};
startServer();
