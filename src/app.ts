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
app.use(logger()); // log request
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
      "https://outcome-based.vercel.app",
      "https://filkom.investsulut.id",
      "https://hgdxm2td-3000.asse.devtunnels.ms",
    ],
  })
);

app.route("/api/ping", RouterPing);
app.route("/api/curriculum", RouterCurriculum);
app.route("/api/subject", RouterSubject);
app.route("/api/rps", RouterRps);
app.route("/api/student-grade", RouterStudentGrade);
app.route("/api/report-detail", RouterReportDetail);
app.route("/api/report-summary", RouterReportSummary);

export default app;
