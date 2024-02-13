import express from "express";
import { validateSchema } from "../middleware";
import { createRpsSchema, xlsxFileSchema } from "../schemas";
import { CreateRps } from "../../global";
import prisma from "../database";
import { extractXlsx } from "../utils";
import multer from "multer";
import { ClassStudent } from "@prisma/client";

const upload = multer();
const RouterRps = express.Router();

RouterRps.post("/", validateSchema(createRpsSchema), async (req, res) => {
  const body: CreateRps = req.body;
  try {
    const {
      cpmkGrading: cpmkGradingPayload,
      cpmk: cpmkPayload,
      studentAssignmentPlan,
      meetingPlan,
      ...rpsPayload
    } = body;
    const result = await prisma.$transaction(async (prisma) => {
      // create rps
      const rps = await prisma.rps.create({
        data: {
          ...rpsPayload,
          MeetingPlan: {
            createMany: {
              data: meetingPlan,
            },
          },
          StudentAssignmentPlan: {
            createMany: {
              data: studentAssignmentPlan,
            },
          },
        },
      });

      // insert grading system
      await Promise.all(
        cpmkGradingPayload.map(async (data) => {
          const { gradingSystem, ...payload } = data;
          await prisma.cpmkGrading.create({
            data: {
              rpsId: rps.id,
              ...payload,
              GradingSystem: {
                createMany: { data: gradingSystem },
              },
            },
          });
        })
      );

      // insert cpmk
      await Promise.all(
        cpmkPayload.map(async (data) => {
          const { supportedCplIds, ...payload } = data;
          await prisma.cpmk.create({
            data: {
              rpsId: rps.id,
              ...payload,
              SupportedCpl: {
                createMany: {
                  data: supportedCplIds.map((value) => ({ cplId: value })),
                },
              },
            },
          });
        })
      );

      return await prisma.rps.findUnique({
        where: {
          id: rps.id,
        },
        include: {
          CpmkGrading: {
            include: {
              GradingSystem: true,
            },
          },
          MeetingPlan: true,
          StudentAssignmentPlan: true,
          Cpmk: true,
        },
      });
    });

    res.status(201).json({
      status: true,
      message: "Rps created successfully",
      data: result,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: false,
        message: "Conflict! please check dupplicate data or code",
        error,
      });
    }

    if (error.code === "P2003") {
      return res.status(404).json({
        status: false,
        message: "Subject or CPL not found",
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
});

RouterRps.post(
  "/:id/member",
  upload.single("classMember"),
  validateSchema(xlsxFileSchema),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    try {
      const data = extractXlsx(file);
      const parsedData: Pick<ClassStudent, "rpsId" | "studentNim">[] = data.map(
        (row: any) => ({
          rpsId: id,
          studentNim: row.nim.toString(),
        })
      );
      const rps = await prisma.rps.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });
      if (!rps) {
        return res.status(404).json({
          status: false,
          message: "Rps not found",
        });
      }
      const result = await prisma.classStudent.createMany({
        data: parsedData,
        skipDuplicates: true,
      });
      res.status(201).json({
        status: true,
        message: "Member added to Rps",
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
      if (error.code === "P2002") {
        return res.status(409).json({
          status: false,
          message: "Student already in the class",
          error,
        });
      }

      res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error,
      });
    }
  }
);

export default RouterRps;
