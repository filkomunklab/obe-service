import { z } from "zod";

const cplSchema = z
  .array(
    z.object({
      code: z.string(),
      description: z.string(),
      curriculumId: z.string(),
    })
  )
  .min(1);
export default cplSchema;
