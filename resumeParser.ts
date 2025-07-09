import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const extractText = async (filePath: string, originalName: string): Promise<string> => {
  const ext = originalName.split(".").pop()?.toLowerCase();
  console.log(`🚀 ~ resumeParser.ts:7 ~ extractText ~ ext:`, ext);

  if (ext === "pdf") {
    console.log(11111111);
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === "docx") {
    console.log(22222);

    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error("Unsupported file type.");
};
