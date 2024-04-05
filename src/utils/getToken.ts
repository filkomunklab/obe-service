import { ExtendedRequest } from "../../global";

export default function getToken(req: ExtendedRequest) {
  let token = req.headers.authorization
    ? req.headers.authorization.replace("Bearer ", "")
    : null;

  return token && token.length ? token : null;
}
