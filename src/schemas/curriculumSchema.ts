import { SubjectType } from "@prisma/client";
import { z } from "zod";
import oneOf from "../utils/oneOf";

const curriculumSchema = z.array(
  z.object({
    code: z.string(),
    indonesiaName: z.string(),
    englishName: z.string(),
    credits: z.number(),
    type: oneOf(Object.values(SubjectType) as any),
    prerequisite: z.array(z.string()).nullable().optional(),
    semester: z.number(),
  })
);

export default curriculumSchema;
