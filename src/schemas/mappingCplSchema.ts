import { z } from "zod";

const mappingCplSchema = z.object({
  id: z.string(),
  cplIds: z.array(z.string()),
});

export default mappingCplSchema;
