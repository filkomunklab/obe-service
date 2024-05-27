import { z } from "zod";

const mappingCplSchema = z.object({
  cplIds: z.array(z.string()),
});

export default mappingCplSchema;
