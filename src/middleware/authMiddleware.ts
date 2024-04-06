import jwt from "jsonwebtoken";
import { getToken } from "../utils";
import prisma from "../database";
import { NextFunction, Request, Response } from "express";
import Config from "../config/config";
import { ExtendedRequest } from "../../global";

export default async function auth(
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let token = getToken(req);

    if (!token) {
      return res
        .status(401)
        .send({ status: "FAILED", data: { error: "token not found" } });
    }

    req.user = jwt.verify(token, Config.SECRET_KEY);
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
      next();
    } else {
      return res
        .status(401)
        .send({ status: "FAILED", data: { error: "token expired" } });
    }
  } catch (error) {
    return res
      .status(401)
      .send({ status: "FAILED", data: { error: "invalid token" } });
  }
}
