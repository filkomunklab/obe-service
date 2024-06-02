import { auth } from "../middleware";
import { studentGradeSchema, xlsxFileSchema } from "../schemas";
import { extractXlsx } from "../utils";
import { StudentGrade } from "@prisma/client";
import prisma from "../database";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

const RouterStudentGrade = new Hono();

RouterStudentGrade.put(
  "/:gradingSystemId",
  auth,
  zValidator("form", xlsxFileSchema),
  async (c) => {
    const { gradingSystemId } = c.req.param();
    const { file } = c.req.valid("form");
    try {
      const data = await extractXlsx(file);
      const parsedData: Pick<StudentGrade, "rawGrade" | "studentNim">[] =
        data.map((item: any) => ({
          rawGrade: item?.grade,
          studentNim: item?.nim?.toString(),
        }));

      const validation = await studentGradeSchema.spa(parsedData);
      if (!validation.success) {
        return c.json(
          {
            status: false,
            message: "Please provide valid xlsx data",
            error: validation.error,
          },
          400
        );
      }

      const targetGrade = await prisma.gradingSystem.findUnique({
        where: {
          id: gradingSystemId,
        },
      });

      if (!targetGrade) {
        return c.json(
          {
            status: false,
            message: "Grading System not found",
          },
          404
        );
      }

      const result = await prisma.$transaction(async (prisma) => {
        return await Promise.all(
          parsedData.map(async (item) => {
            const score = item.rawGrade * (targetGrade.gradingWeight / 100);
            return await prisma.studentGrade.upsert({
              where: {
                studentGradeId: {
                  studentNim: item.studentNim,
                  gradingSystemId,
                },
              },
              create: {
                rawGrade: item.rawGrade,
                studentNim: item.studentNim,
                score,
                gradingSystemId,
              },
              update: {
                rawGrade: item.rawGrade,
                score,
              },
            });
          })
        );
      });
      return c.json({
        status: true,
        message: "Grade insert successfully",
        data: result,
      });
    } catch (error: any) {
      if (error.code === "P2003") {
        return c.json(
          {
            status: false,
            message: "Student nim on the list not found",
            error,
          },
          404
        );
      }
      console.log(error);
      return c.json(
        {
          status: false,
          message: "Internal Server Error",
          error,
        },
        500
      );
    }
  }
);

export default RouterStudentGrade;
