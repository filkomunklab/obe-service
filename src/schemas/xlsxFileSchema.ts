import { z } from "zod";
import { checkFileFormat } from "../utils";

const xlsxFileSchema = z.object({
  file: z.any().refine(checkFileFormat, "Unsupported Format"),
});

export default xlsxFileSchema;
