import express from "express";
import multer from "multer";
import { validateSchema } from "../middleware";
import { xlsxFileSchema } from "../schemas";
import { extractXlsx } from "../utils";
import { StudentGrade } from "@prisma/client";
import prisma from "../database";

const upload = multer();
const RouterStudentGrade = express.Router();

RouterStudentGrade.put(
  "/:gradingSystemId",
  upload.single("grade"),
  validateSchema(xlsxFileSchema),
  async (req, res) => {
    const gradingSystemId = req.params.gradingSystemId;
    const file = req.file;
    try {
      const data = extractXlsx(file);
      const parsedData: Pick<StudentGrade, "rawGrade" | "studentNim">[] =
        data.map((item: any) => ({
          rawGrade: item.grade,
          studentNim: item.nim.toString(),
        }));

      const targetGrade = await prisma.gradingSystem.findUnique({
        where: {
          id: gradingSystemId,
        },
      });

      if (!targetGrade) {
        return res.status(404).json({
          status: false,
          message: "Grading System not found",
        });
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
      res.status(200).json({
        status: true,
        message: "Grade insert successfully",
        data: result,
      });
    } catch (error) {
      if (error.code === "P2003") {
        return res.status(404).json({
          status: false,
          message: "Student nim on the list not found",
          error,
        });
      }
      console.log(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error,
      });
    }
  }
);

export default RouterStudentGrade;
