import { z } from "zod";
const classMemberSchema = z.array(
  z.object({
    rpsId: z.string(),
    studentNim: z.string(),
  })
);

export default classMemberSchema;
