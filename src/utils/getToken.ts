import { HonoRequest } from "hono";

export default function getToken(req: HonoRequest) {
  let token = req.header("Authorization")
    ? req.header("Authorization")?.split(" ")[1]
    : null;

  return token && token.length ? token : null;
}
