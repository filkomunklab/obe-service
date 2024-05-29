import { z } from "zod";

const studentGradeSchema = z.array(
  z.object({
    studentNim: z.string(),
    rawGrade: z.number().max(100),
  })
);

export default studentGradeSchema;
