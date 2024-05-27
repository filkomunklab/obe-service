import { z } from "zod";
import { checkFileFormat } from "../utils";

const xlsxFileSchema = z.object({
  curriculumCpl: z.any().refine(checkFileFormat, "Unsupported Format"),
});

export default xlsxFileSchema;
