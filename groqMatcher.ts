import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export const matchResumeToJD = async (resumeText: string, jobDescriptionText: string): Promise<string> => {
  console.log("Job Description Text (Raw):", jobDescriptionText); // Debug log
  console.log("Resume Text:", resumeText); // Debug log

  // Preprocess job description to isolate core content
  let jobDescriptionTextCleaned = jobDescriptionText
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .split("Salary:")[0] // Remove everything after "Salary:"
    .trim();
  console.log("Job Description Text (Cleaned):", jobDescriptionTextCleaned);

  // Basic length check
  if (jobDescriptionTextCleaned.length < 50) {
    return JSON.stringify({
      score: 0,
      strengths: [],
      weaknesses: [],
      final_verdict: "Reject",
      candidate_type: "Unknown",
      training_suggestions: {
        skills: [],
        reason: "Job description is too short. Please provide a detailed job description with specific requirements.",
      },
    });
  }

  const prompt = `
  You are an AI HR assistant with expertise in candidate assessment across all industries for 2025. Before assessing the resume against the job description, evaluate the job description's validity. A valid job description must contain at least 50 characters and include at least one of the following: a job title (e.g., 'Junior Web Developer'), a responsibility (e.g., 'developing web applications'), a skill (e.g., 'PHP'), an experience requirement (e.g., '0-2 years'), or a qualification (e.g., 'problem-solving skills'). A 'job objective' or formal section headers (e.g., 'Responsibilities:') are not required and should be ignored if absent. Ignore any text after 'Salary:' or similar markers and focus only on the preceding content. If the job description is invalid (e.g., too short, nonsensical like 'hello' or 'dummy text', or completely lacks any of the above elements), return a JSON with a score of 0 and a clear error message.

  Return a JSON response only, strictly following this structure based on the evaluation:
  - If job description is invalid:
  {
    "score": 0,
    "strengths": [],
    "weaknesses": [],
    "final_verdict": "Reject",
    "candidate_type": "Unknown",
    "training_suggestions": {
      "skills": [],
      "reason": "The job description is invalid because it does not contain a job title, responsibility, skill, experience, or qualification. It only includes a job title and a brief description of the job."
    }
  }
  - If job description is valid:
  {
    "score": <number, 0-10, based on precise alignment with job description>,
    "strengths": <array of 5-7 strings, highlighting specific relevant skills, experience, or qualifications>,
    "weaknesses": <array of 5-7 strings, identifying specific gaps relative to the job>,
    "final_verdict": <string, one of "Hire", "Train & Hire", or "Reject", based on score and fit>,
    "candidate_type": <string, dynamically inferred from resume skills and experience, e.g., "Junior Developer", "Web Developer">,
    "training_suggestions": {
      "skills": <array of 2-3 skills, tools, or qualifications relevant to the job description, empty if not "Train & Hire">,
      "reason": <string detailing why these skills are suggested, linking to weaknesses, job requirements, and 2025 industry trends>
    }
  }

  Job Description:
  ${jobDescriptionTextCleaned}

  Resume:
  ${resumeText}

  Guidelines:
  - Validate the job description by confirming at least 50 characters and the presence of at least one job-related element (job title, responsibility, skill, experience, qualification). No other criteria are required.
  - Assign a score (0-10) only if the job description is valid, based on how well the resume aligns with the job requirements.
  - List 5-7 strengths and weaknesses only if the job description is valid, focusing on specific matches or gaps between resume and job description.
  - Determine final_verdict: "Hire" for scores 8-10, "Train & Hire" for 5-7, "Reject" for 0-4 (only if valid).
  - Infer candidate_type dynamically based on resume skills and experience, aligned with the job description (only if valid).
  - For "Train & Hire", suggest 2-3 skills/tools/qualifications that address weaknesses and align with job requirements (only if valid).
  - For invalid job descriptions, ensure the 'reason' field provides a simple, actionable message.
  - Ensure JSON is valid and properly formatted.
  - Provide a brief explanation of the validation decision in the 'reason' field if invalid, to help debug (e.g., "No job title, skills, or responsibilities found").
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = response.data.choices[0].message.content.trim();
    console.log("Raw AI Response:", content); // Debugging log

    const jsonMatch = content.match(/\{.*\}/s);
    if (!jsonMatch) {
      throw new Error("No valid JSON in response");
    }

    const result = JSON.parse(jsonMatch[0]);
    return JSON.stringify(result);
  } catch (err: any) {
    console.error("API error:", err.response?.data || err.message);
    return JSON.stringify({
      score: 0,
      strengths: [],
      weaknesses: [],
      final_verdict: "Reject",
      candidate_type: "Unknown",
      training_suggestions: {
        skills: [],
        reason: "Failed to process AI response: " + (err.response?.data?.error?.message || err.message),
      },
    });
  }
};