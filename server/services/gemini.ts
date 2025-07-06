import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface RoleAnalysis {
  roles: Array<{
    title: string;
    match: number;
    industry: string;
    salaryRange: string;
  }>;
  skills: string[];
  experienceLevel: string;
  location: string;
  industries: string[];
}

export interface JobMatch {
  matchScore: number;
  missingSkills: string[];
  recommendations: string[];
  optimizedSections: {
    summary: string;
    skills: string[];
    experience: string[];
  };
}

export async function analyzeResumeForRoles(resumeText: string): Promise<RoleAnalysis> {
  const prompt = `You are a career coach. Analyze the following resume and provide:
1. Top 5 job roles the candidate is qualified for with match percentages
2. Main skills detected
3. Experience level (Junior, Mid-level, Senior, Executive)
4. Likely location preferences
5. Industry focus areas

Resume:
"""${resumeText}"""

Respond with JSON only.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          roles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                match: { type: "number" },
                industry: { type: "string" },
                salaryRange: { type: "string" }
              },
              required: ["title", "match", "industry", "salaryRange"]
            }
          },
          skills: {
            type: "array",
            items: { type: "string" }
          },
          experienceLevel: { type: "string" },
          location: { type: "string" },
          industries: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["roles", "skills", "experienceLevel", "location", "industries"]
      }
    },
    contents: prompt,
  });

  const rawJson = response.text;
  if (!rawJson) {
    throw new Error("Empty response from Gemini API");
  }

  return JSON.parse(rawJson);
}

export async function compareResumeToJob(resumeText: string, jobDescription: string): Promise<JobMatch> {
  const prompt = `You're a resume expert. Compare this resume to the job description:
1. Calculate overall match score (0-100)
2. Identify missing or weak skills
3. Suggest specific improvements
4. Provide optimized content sections

Resume:
"""${resumeText}"""

Job Description:
"""${jobDescription}"""

Respond with JSON only.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          matchScore: { type: "number" },
          missingSkills: {
            type: "array",
            items: { type: "string" }
          },
          recommendations: {
            type: "array",
            items: { type: "string" }
          },
          optimizedSections: {
            type: "object",
            properties: {
              summary: { type: "string" },
              skills: {
                type: "array",
                items: { type: "string" }
              },
              experience: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["summary", "skills", "experience"]
          }
        },
        required: ["matchScore", "missingSkills", "recommendations", "optimizedSections"]
      }
    },
    contents: prompt,
  });

  const rawJson = response.text;
  if (!rawJson) {
    throw new Error("Empty response from Gemini API");
  }

  return JSON.parse(rawJson);
}

export async function generateCoverLetter(resumeText: string, jobDescription: string, companyName: string): Promise<string> {
  const prompt = `Write a professional cover letter for this job. Make it personalized and compelling, 250-300 words.

Resume:
"""${resumeText}"""

Job Description:
"""${jobDescription}"""

Company: ${companyName}

Write a complete cover letter that highlights relevant experience and shows enthusiasm for the role.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "";
}

export async function generateOptimizedResume(resumeText: string, jobMatch: JobMatch): Promise<string> {
  const prompt = `Create an optimized version of this resume based on the analysis. 
Incorporate the recommended improvements while maintaining the candidate's authentic experience.

Original Resume:
"""${resumeText}"""

Optimization Guidelines:
- Summary: ${jobMatch.optimizedSections.summary}
- Skills to emphasize: ${jobMatch.optimizedSections.skills.join(", ")}
- Experience improvements: ${jobMatch.recommendations.join("; ")}

Return the complete optimized resume in a professional format.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "";
}
