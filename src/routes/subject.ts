import express from "express";
import prisma from "../database";
import { Subject_Cpl } from "../../global";

const RouterSubject = express.Router();

RouterSubject.post("/:id/cpl-mapping", async (req, res) => {
  const { cplIds } = req.body;
  const { id } = req.params;

  const payload: Subject_Cpl[] = cplIds.map((cplId: string) => {
    return {
      cplId,
      subjectId: id,
    };
  });

  const data = await prisma.$transaction(async (prisma) => {
    await prisma.subject_Cpl.createMany({
      data: payload,
    });

    return await prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        Subject_Cpl: {
          select: {
            cpl: true,
          },
        },
      },
    });
  });

  res.status(201).send(data);
});

export default RouterSubject;
