import { cors } from "hono/cors";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { serveStatic } from "hono/bun";
import * as path from "path";

//Router List
import RouterPing from "./routes/ping";
import RouterCurriculum from "./routes/curriculum";
import RouterSubject from "./routes/subject";
import RouterRps from "./routes/rps";
import RouterStudentGrade from "./routes/studentGrade";
// import RouterReportSummary from "./routes/reportSummary";
// import RouterReportDetail from "./routes/reportDetail";

const app = new Hono().basePath("/api");

app.use(prettyJSON());
app.use(logger()); // log request
app.use("/static/*", serveStatic({ path: path.join(__dirname, "../public") }));
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

app.route("/ping", RouterPing);
app.route("/curriculum", RouterCurriculum);
app.route("/subject", RouterSubject);
app.route("/rps", RouterRps);
app.route("/student-grade", RouterStudentGrade);
// app.route("/report-summary", RouterReportSummary);
// app.route("/report-detail", RouterReportDetail);

export default app;
