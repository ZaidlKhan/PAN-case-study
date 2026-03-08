import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../../environments/environment';

export interface AiAnalysis {
  score: number;
  scoreMessage: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  sections: {
    name: string;
    score: number;
    maxScore: number;
    details: string[];
  }[];
  tips: { text: string; priority: 'high' | 'medium' | 'low' }[];
  courses: { title: string; provider: string; url: string; free: boolean; reason: string }[];
  people: { name: string; title: string; company: string; linkedinUrl: string; reason: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const key = environment.geminiApiKey;
    console.log('GeminiService: API key configured?', !!key && key !== 'YOUR_GEMINI_API_KEY_HERE');
    if (key && key !== 'YOUR_GEMINI_API_KEY_HERE') {
      this.ai = new GoogleGenAI({ apiKey: key });
    }
  }

  isConfigured(): boolean {
    return this.ai !== null;
  }

  async parseResume(resumeText: string): Promise<{
    skills: { skillId: string; proficiency: 'beginner' | 'intermediate' | 'advanced' }[];
    employmentHistory: {
      title: string;
      company: string;
      startDate: string;
      endDate: string | null;
      current: boolean;
      duties: string[];
    }[];
  }> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Parse this resume and extract structured data from it.

RESUME:
${resumeText.slice(0, 4000)}

KNOWN SKILL IDS (use these exact IDs when matching):
javascript, typescript, python, java, go, rust, ruby, swift, kotlin, c-plus-plus, c-sharp,
react, angular, vue, nextjs, nodejs, express, django, flask, spring,
html, css, sass, tailwind,
aws, azure, gcp, docker, kubernetes, terraform, linux,
sql, postgresql, mysql, mongodb, redis, dynamodb, elasticsearch,
git, ci-cd, jenkins, github-actions, gitlab,
rest-api, graphql, microservices, system-design,
machine-learning, deep-learning, nlp, computer-vision, pytorch, tensorflow, scikit-learn, pandas, numpy,
agile, scrum, jira, unit-testing, jest, cypress,
figma, sketch, adobe-xd

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "skills": [
    {"skillId": "python", "proficiency": "advanced"},
    {"skillId": "react", "proficiency": "intermediate"}
  ],
  "employmentHistory": [
    {
      "title": "Software Engineer",
      "company": "Google",
      "startDate": "2022-06",
      "endDate": null,
      "current": true,
      "duties": ["Built microservices handling 1M+ requests", "Led team of 4 engineers"]
    }
  ]
}

Rules:
- skills: match resume skills to the KNOWN SKILL IDS list above. Only use IDs from that list. Estimate proficiency based on context (years of experience, how prominently featured, etc.)
- employmentHistory: extract every job listed, in reverse chronological order (most recent first). Parse dates as YYYY-MM format. If currently employed, set current=true and endDate=null. Extract 2-4 key duties per job.
- Be thorough — extract every skill and every job you can find`;

    const response = await this.ai!.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = (response.text || '')
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    console.log('Resume parse response:', text.slice(0, 500));

    const parsed = JSON.parse(text);

    // Validate skills
    const skills = Array.isArray(parsed.skills) ? parsed.skills
      .filter((s: any) => s && s.skillId)
      .map((s: any) => ({
        skillId: String(s.skillId),
        proficiency: ['beginner', 'intermediate', 'advanced'].includes(s.proficiency) ? s.proficiency : 'intermediate',
      })) : [];

    // Validate employment
    const employmentHistory = Array.isArray(parsed.employmentHistory) ? parsed.employmentHistory
      .filter((j: any) => j && j.title && j.company)
      .map((j: any) => ({
        title: String(j.title),
        company: String(j.company),
        startDate: String(j.startDate || ''),
        endDate: j.current ? null : (j.endDate ? String(j.endDate) : null),
        current: Boolean(j.current),
        duties: Array.isArray(j.duties) ? j.duties.map(String) : [],
      })) : [];

    return { skills, employmentHistory };
  }

  async analyzeResume(resumeText: string, jobDescription: string): Promise<AiAnalysis> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    // STEP 1: Analyze resume (no search needed)
    const analysisPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume against the job description.

RESUME:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "score": 72,
  "scoreMessage": "Brief 1-2 sentence summary",
  "matchedKeywords": ["skill1", "skill2"],
  "missingKeywords": ["skill3", "skill4"],
  "sections": [
    {"name": "Technical Skills", "score": 30, "maxScore": 40, "details": ["Found: Python, SQL", "Missing: Kubernetes"]},
    {"name": "Experience & Impact", "score": 18, "maxScore": 25, "details": ["Strong action verbs", "Needs more metrics"]},
    {"name": "Education & Certifications", "score": 10, "maxScore": 15, "details": ["Degree matches", "Missing AWS cert"]},
    {"name": "Resume Quality", "score": 14, "maxScore": 20, "details": ["Good structure", "Could be more concise"]}
  ],
  "tips": [
    {"text": "actionable tip referencing specific content", "priority": "high"}
  ]
}

Rules:
- score: 0-100 overall match percentage
- matchedKeywords: every skill, technology, tool, or framework found in BOTH resume and job description
- missingKeywords: every skill, technology, tool, or framework in the job description but NOT in the resume
- sections: exactly 4 as shown, scores must not exceed maxScore, each detail must reference actual content from the resume or job posting
- tips: 3-5 sorted by priority (high first), each must reference a specific gap or weakness`;

    const analysisResponse = await this.ai!.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: analysisPrompt,
    });

    const analysisText = (analysisResponse.text || '')
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    console.log('Analysis response:', analysisText.slice(0, 500));

    const analysis = JSON.parse(analysisText) as AiAnalysis;
    analysis.score = Math.max(0, Math.min(100, Math.round(analysis.score)));

    const expectedMax: Record<string, number> = {
      'Technical Skills': 40,
      'Experience & Impact': 25,
      'Education & Certifications': 15,
      'Resume Quality': 20,
    };
    for (const section of analysis.sections) {
      if (expectedMax[section.name]) {
        section.maxScore = expectedMax[section.name];
        section.score = Math.max(0, Math.min(section.maxScore, Math.round(section.score)));
      }
    }

    // STEP 2: Search for real courses and real LinkedIn people (separate call WITH google search)
    const missingSkills = analysis.missingKeywords.slice(0, 8).join(', ');

    const searchPrompt = `I need you to search the internet for two things. First, read this job description to identify the company name and job title:

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

MISSING SKILLS TO LEARN: ${missingSkills}

TASK 1 — COURSES:
Search for real online courses that teach the missing skills listed above. Search Coursera, Udemy, YouTube, freeCodeCamp, edX, etc. Return the exact title, platform, and URL from your search results.

TASK 2 — LINKEDIN PEOPLE & RECRUITERS:
From the job description above, identify the company name. Then search LinkedIn for real people who work at THAT SPECIFIC COMPANY — both people in the role and recruiters/talent acquisition who hire for it. Use search queries like:
- "site:linkedin.com/in [job title] [company name]"
- "site:linkedin.com/in recruiter [company name]"
- "site:linkedin.com/in talent acquisition [company name]"

IMPORTANT: Only return people who work at the company from the job description. If you cannot find anyone at that specific company, return an empty array for "people". Do NOT make up profiles or return people from other companies.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "courses": [
    {"title": "exact course name", "provider": "Coursera/Udemy/YouTube/etc", "url": "exact URL from search", "free": true, "reason": "covers missing skill X"}
  ],
  "people": [
    {"name": "exact name from LinkedIn", "title": "their exact title", "company": "the company name", "linkedinUrl": "exact LinkedIn URL from search", "reason": "works as X or recruits for X roles at this company"}
  ]
}

Return 3-5 courses. For people, return 3-5 ONLY if they work at the company from the job description. If none found, return an empty array []. Every URL MUST come from your actual search results.`;

    try {
      const searchResponse = await this.ai!.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const searchText = (searchResponse.text || '')
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      console.log('Search response:', searchText.slice(0, 500));

      const searchData = JSON.parse(searchText);
      analysis.courses = searchData.courses || [];
      analysis.people = searchData.people || [];
    } catch (searchError) {
      console.error('Search call failed:', searchError);
      analysis.courses = [];
      analysis.people = [];
    }

    return analysis;
  }
}
