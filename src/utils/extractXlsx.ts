import xlsx from "xlsx";

export default function extractXlsx(file: Express.Multer.File) {
  const workbook = xlsx.read(file.buffer);
  const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
}
