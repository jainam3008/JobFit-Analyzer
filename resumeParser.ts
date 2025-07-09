import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const extractText = async (filePath: string, originalName: string): Promise<string> => {
  const ext = originalName.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error("Unsupported file type.");
};
