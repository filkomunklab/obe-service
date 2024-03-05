import express, { Application, Router } from "express";
import http from "http";
import Config from "./config/config";

//Router List
import RouterPing from "./routes/ping";
import RouterCurriculum from "./routes/curriculum";
import RouterSubject from "./routes/subject";
import RouterRps from "./routes/rps";
import RouterStudentGrade from "./routes/studentGrade";
import RouterReportSummary from "./routes/reportSummary";

const app: Application = express();
const httpServer = http.createServer(app);
const RouterApi = Router();

app.use(express.json());

app.use("/api", RouterApi);
(async () => {
  try {
    RouterApi.use("/ping", RouterPing);
    RouterApi.use("/curriculum", RouterCurriculum);
    RouterApi.use("/subject", RouterSubject);
    RouterApi.use("/rps", RouterRps);
    RouterApi.use("/student-grade", RouterStudentGrade);
    RouterApi.use("/report-summary", RouterReportSummary);

    httpServer.listen(Config.PORT, () =>
      console.log(`Server running on port ${Config.PORT}`)
    );
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();
