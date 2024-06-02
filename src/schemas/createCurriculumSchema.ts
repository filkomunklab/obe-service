import { Major } from "@prisma/client";
import { z } from "zod";
import oneOf from "../utils/oneOf";
import { checkFileFormat } from "../utils";

const createCurriculumSchema = z.object({
  major: oneOf(Object.values(Major) as any),
  year: z.string().length(4).regex(/^\d+$/, "Year must be a number"),
  headOfProgramStudyId: z.string(),
  curriculumFile: z.any().refine(checkFileFormat, "Invalid file type"),
});

export default createCurriculumSchema;
