import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { extractText } from "./resumeParser";
import { matchResumeToJD } from "./groqMatcher";
import { Request, Response } from "express";

const app = express();
app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3005;

app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const upload = multer({ dest: "uploads/" });

interface MulterFile {
  [fieldname: string]: Express.Multer.File[];
}

app.get("/", (req: Request, res: Response) => {
  res.render("index", { result: undefined });
});

app.post("/upload", upload.fields([{ name: "resume" }, { name: "jobDescription" }]), async (req: Request, res: Response): Promise<void> => {
  const files = req.files as MulterFile;

  const resumePath = files?.resume?.[0]?.path;
  const resumeOriginalName = files?.resume?.[0]?.originalname;
  const jdPath = files?.jobDescription?.[0]?.path;
  const jdOriginalName = files?.jobDescription?.[0]?.originalname;

  if (!resumePath) {
    console.error("No resume file uploaded");
    res.status(400).send("Resume file is required.");
    return;
  }
  if (!jdPath) {
    console.error("No job description file uploaded");
    res.status(400).send("Job description file is required.");
    return;
  }

  try {
    const resumeText = await extractText(resumePath, resumeOriginalName);
    const jdText = await extractText(jdPath, jdOriginalName);
    if (!resumeText || !jdText || resumeText.trim() === "" || jdText.trim() === "") {
      throw new Error("No text extracted from resume or job description");
    }
    const result = await matchResumeToJD(resumeText, jdText);
    fs.unlinkSync(resumePath);
    fs.unlinkSync(jdPath);
    res.render("index", { result });
  } catch (err: any) {
    console.error("Error processing upload:", err.stack);
    res.status(500).render("index", { result: JSON.stringify({ score: 0, strengths: [], weaknesses: [], final_verdict: "Error: " + err.message, candidate_type: "Unknown", training_suggestions: { languages: [], reason: "" } }) });
  }
});

app.listen(PORT, () => console.log(`🟢 Server running at http://localhost:${PORT} at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`));