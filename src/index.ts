import app from "./app";
import Config from "./config";

const server = Bun.serve({
  port: Config.PORT,
  fetch: app.fetch,
});

console.log(`Server running on port ${server.port}`);
