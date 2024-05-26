import * as xlsx from "xlsx";

export default async function extractXlsx(file: Blob) {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const workbook = xlsx.read(uint8Array, { type: "array" });
  const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
}
