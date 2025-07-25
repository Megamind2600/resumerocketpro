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
  explanation: string;
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
  console.log('🤖 Analyzing resume with Gemini AI...');
  console.log('📝 Resume text length:', resumeText.length);

  const prompt = `You are a career coach. Analyze the following resume and provide:
1. Top 5 job roles the candidate is qualified for with match percentages
2. Main skills detected
3. Experience level (Junior, Mid-level, Senior, Executive)
4. Likely location preferences
5. Industry focus areas
6. A 1 liner explanation of why these roles suit the candidate's profile

Resume:
"""${resumeText}"""

Respond with JSON only.`;

  try {
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
            },
            explanation: { type: "string" }
          },
          required: ["roles", "skills", "experienceLevel", "location", "industries", "explanation"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    console.log('✅ Gemini AI response received:', rawJson ? 'Success' : 'Empty');
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed = JSON.parse(rawJson);
    console.log('📊 Analysis complete - Found', parsed.roles?.length || 0, 'roles');
    return parsed;
    
  } catch (error) {
    console.error('❌ Gemini AI analysis failed:', error);
    throw error;
  }
}

export async function compareResumeToJob(resumeText: string, jobDescription: string): Promise<JobMatch> {
  console.log('🤖 Comparing resume to job with Gemini AI...');
  console.log('📝 Resume text length:', resumeText.length);
  console.log('💼 Job description length:', jobDescription.length);

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

  try {
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
    console.log('✅ Gemini AI job match response received:', rawJson ? 'Success' : 'Empty');
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed = JSON.parse(rawJson);
    console.log('📊 Job match analysis complete - Score:', parsed.matchScore || 0);
    return parsed;
    
  } catch (error) {
    console.error('❌ Gemini AI job match failed:', error);
    throw error;
  }
}

export async function generateCoverLetter(resumeText: string, jobDescription: string, companyName: string): Promise<string> {
  console.log('🤖 Generating cover letter with Gemini AI...');
  console.log('🏢 Company:', companyName);

  const prompt = `Write a professional cover letter for this job. Make it personalized and compelling, 250-300 words.

Resume:
"""${resumeText}"""

Job Description:
"""${jobDescription}"""

Company: ${companyName}

Write a complete cover letter that highlights relevant experience and shows enthusiasm for the role.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const coverLetter = response.text || "";
    console.log('✅ Cover letter generated:', coverLetter.length, 'characters');
    return coverLetter;
    
  } catch (error) {
    console.error('❌ Gemini AI cover letter generation failed:', error);
    throw error;
  }
}

export async function generateOptimizedResume(resumeText: string, jobMatch: JobMatch): Promise<string> {
  console.log('🤖 Generating optimized resume with Gemini AI...');
  console.log('📈 Match score:', jobMatch.matchScore);

  const prompt = `Create an optimized version of this resume based on the analysis. 
Incorporate the recommended improvements while maintaining the candidate's authentic experience. Use appropriate formating, like align the name centrally, work expereince section, then education, skills, etc.

Original Resume:
"""${resumeText}"""

Optimization Guidelines:
- Summary: ${jobMatch.optimizedSections.summary}
- Skills to emphasize: ${jobMatch.optimizedSections.skills.join(", ")}
- Experience improvements: ${jobMatch.recommendations.join("; ")}

Return the complete optimized resume in a professional format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const optimizedResume = response.text || "";
    console.log('✅ Optimized resume generated:', optimizedResume.length, 'characters');
    return optimizedResume;
    
  } catch (error) {
    console.error('❌ Gemini AI resume optimization failed:', error);
    throw error;
  }
}
