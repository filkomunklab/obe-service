import { cors } from "hono/cors";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { serveStatic } from "hono/bun";

//Router List
import RouterPing from "./routes/ping";
import RouterCurriculum from "./routes/curriculum";
import RouterSubject from "./routes/subject";
import RouterRps from "./routes/rps";
import RouterStudentGrade from "./routes/studentGrade";
import RouterReportDetail from "./routes/reportDetail";
import RouterReportSummary from "./routes/reportSummary";

const app = new Hono();

app.use(prettyJSON());
process.env.NODE_ENV !== "test" && app.use(logger()); // log request
app.use(
  "/static/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/static\//, "/public/"),
  })
);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://app.filkom.unklab.ac.id",
      "http://app.filkom.unklab.ac.id",
      "http://103.59.95.208:3000",
    ],
  })
);

app
  .basePath("/api")
  .route("/ping", RouterPing)
  .route("/curriculum", RouterCurriculum)
  .route("/subject", RouterSubject)
  .route("/rps", RouterRps)
  .route("/student-grade", RouterStudentGrade)
  .route("/report-detail", RouterReportDetail)
  .route("/report-summary", RouterReportSummary);

export default app;
