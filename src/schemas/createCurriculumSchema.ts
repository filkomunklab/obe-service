import { Major } from "@prisma/client";
import { z } from "zod";
import oneOf from "../utils/oneOf";

const checkFileFormat = (value: Blob) => {
  const fileType = value.type;
  return (
    fileType ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
};

const createCurriculumSchema = z.object({
  major: oneOf(Object.values(Major) as any),
  year: z.string().length(4).regex(/^\d+$/, "Year must be a number"),
  headOfProgramStudyId: z.string(),
  curriculumFile: z.any().refine(checkFileFormat, "Invalid file type"),
});

export default createCurriculumSchema;
