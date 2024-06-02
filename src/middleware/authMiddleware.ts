// import jwt from "jsonwebtoken";
import { getToken } from "../utils";
import prisma from "../database";
import Config from "../config/config";
import { ExtendedContext } from "../../global";
import { Context, Next } from "hono";
import { verify } from "hono/jwt";

export default async function auth(c: ExtendedContext, next: Next) {
  try {
    let token = getToken(c.req);

    if (!token) {
      return c.json(
        { status: "FAILED", data: { error: "token not found" } },
        401
      );
    }

    // c.req.user = jwt.verify(token, Config.SECRET_KEY);
    c.req.user = await verify(token, Config.SECRET_KEY);
    const isAdmin = await prisma.admin.findUnique({
      where: {
        token,
      },
    });
    const isEmployee = await prisma.employee.findUnique({
      where: {
        token,
      },
    });
    const isStudent = await prisma.student.findUnique({
      where: {
        token,
      },
    });

    if (isAdmin || isEmployee || isStudent) {
      // The token belongs to an admin, employee, or student
      await next();
    } else {
      return c.json(
        { status: "FAILED", data: { error: "token expired" } },
        401
      );
    }
  } catch (error) {
    return c.json({ status: "FAILED", data: { error: "invalid token" } }, 401);
  }
}
