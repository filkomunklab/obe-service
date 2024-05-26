import { z } from "zod";

const checkFileFormat = (value: any) => {
  const fileType = value.mimetype;
  return (
    fileType ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
};

const xlsxFileSchema = z.object({
  file: z.any().refine(checkFileFormat, "Unsupported Format"),
});

export default xlsxFileSchema;
