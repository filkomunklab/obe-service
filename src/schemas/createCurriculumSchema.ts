import { Major } from "@prisma/client";
import * as yup from "yup";

const checkFileFormat = (value: any) => {
  const fileType = value.mimetype;
  return (
    fileType ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
};

const createCurriculumSchema = yup.object().shape({
  major: yup.string().oneOf(Object.values(Major)).required(),
  year: yup
    .string()
    .length(4)
    .matches(/^\d+$/, "Year must be a number")
    .required(),
  headOfProgramStudyId: yup.string().required(),
  file: yup
    .mixed()
    .required()
    .test("fileType", "Invalid file type", checkFileFormat),
});

export default createCurriculumSchema;
