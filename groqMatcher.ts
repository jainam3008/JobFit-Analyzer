import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export const matchResumeToJD = async (resumeText: string, jobDescriptionText: string): Promise<string> => {
  const prompt = `
You are an AI HR assistant with expertise in candidate assessment and programming language trends. Assess the provided resume against the job description. Return a JSON response only, strictly following this structure:
{
  "score": <number, 0-10, based on alignment with job description>,
  "strengths": <array of 3-5 strings, highlighting relevant skills or experience>,
  "weaknesses": <array of 3-5 strings, identifying gaps relative to the job>,
  "final_verdict": <string, one of "Hire", "Train & Hire", or "Reject", based on score and fit>,
  "candidate_type": <string, e.g., "Beginner", "Web Developer", "Mobile Developer", based on resume experience>,
  "training_suggestions": {
    "languages": <array of 2-3 programming languages to train if verdict is "Train & Hire", otherwise empty array>,
    "reason": <string detailing why these languages are suggested (if applicable), linking to weaknesses, job requirements, and 2025 industry trends>
  }
}

Job Description:
${jobDescriptionText}

Resume:
${resumeText}

Guidelines:
- Infer the candidate type based on experience level and skills (e.g., Beginner: 0-1 years, Web Developer: HTML/CSS focus, Mobile Developer: Android/iOS focus).
- Determine the final_verdict based on the score: "Hire" for 8-10, "Train & Hire" for 4-7, "Reject" for 0-3.
- Prioritize languages that bridge weaknesses and match job requirements, considering 2025 industry trends (e.g., JavaScript/Node.js for web, Python for data, Kotlin/Swift for mobile), but only if verdict is "Train & Hire".
- Ensure the reason justifies the language choice with specific resume gaps and job context, or leave empty if no training is needed.
`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Groq API response:", response.data);
    let content = response.data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{.*\}/s);
    if (jsonMatch) {
      return jsonMatch[0]; // Return the matched JSON string
    }
    throw new Error("No valid JSON in response");
  } catch (err: any) {
    console.error("API error:", err.response?.data || err.message);
    throw new Error("Failed to get AI response: " + (err.response?.data?.error?.message || err.message));
  }
};