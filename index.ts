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
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);

const upload = multer({ dest: "uploads/" });

interface MulterFile {
  [fieldname: string]: Express.Multer.File[];
}

app.get("/", (req: Request, res: Response) => {
  res.render("index", { result: undefined, error: undefined });
});

app.post("/upload", upload.fields([{ name: "resume" }, { name: "jobDescription" }]), async (req: Request, res: Response): Promise<void> => {
  const files = req.files as MulterFile;
  const { jdText } = req.body;

  const resumePath = files?.resume?.[0]?.path;
  const resumeOriginalName = files?.resume?.[0]?.originalname;
  const jdPath = files?.jobDescription?.[0]?.path;
  const jdOriginalName = files?.jobDescription?.[0]?.originalname;

  if (!resumePath) {
    console.error("No resume file uploaded");
    res.status(400).render("index", { result: undefined, error: "Resume file is required." });
    return;
  }

  if (!jdPath && !jdText) {
    console.error("No job description provided");
    res.status(400).render("index", { result: undefined, error: "Job description file or text is required." });
    return;
  }

  if (jdPath && jdText) {
    console.error("Both job description file and text provided");
    res.status(400).render("index", { result: undefined, error: "Please provide either a job description file or text, not both." });
    return;
  }

  try {
    const resumeText = await extractText(resumePath, resumeOriginalName);
    let jdTextFinal: string;

    if (jdPath) {
      jdTextFinal = await extractText(jdPath, jdOriginalName);
    } else {
      jdTextFinal = jdText.trim();
    }

    // Validate job description length and content
    if (!resumeText || !jdTextFinal || resumeText.trim() === "" || jdTextFinal.trim() === "") {
      throw new Error("No text extracted from resume or job description");
    }

    const result = await matchResumeToJD(resumeText, jdTextFinal);
    if (resumePath) fs.unlinkSync(resumePath);
    if (jdPath) fs.unlinkSync(jdPath);
    res.render("index", { result, error: undefined });
  } catch (err: any) {
    console.error("Error processing upload:", err.stack);
    res.status(500).render("index", {
      result: undefined,
      error: err.message || "An error occurred while processing the files."
    });
  }
});

app.listen(PORT, () => console.log(`🟢 Server running at http://localhost:${PORT} at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`));