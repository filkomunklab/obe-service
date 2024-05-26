import { Hono } from "hono";

const RouterPing = new Hono();

RouterPing.get("/", async (c) => {
  c.json({
    status: true,
    message: "pong",
  });
});

export default RouterPing;
