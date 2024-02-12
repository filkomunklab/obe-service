import express from "express";
import { validateSchema } from "../middleware";
import { createRpsSchema } from "../schemas";
import { CreateRps } from "../../global";
import prisma from "../database";

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
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

export default RouterRps;
