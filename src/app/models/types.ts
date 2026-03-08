export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill {
  skillId: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced';
}

export interface RoleRequirement {
  skillId: string;
  importance: 'must-have' | 'recommended';
  frequency: number;
}

export interface Role {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirements: RoleRequirement[];
}

export interface EmploymentEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  duties: string[];
}

export interface MockProfile {
  id: string;
  name: string;
  avatar: string;
  currentRole: string;
  company: string;
  targetRoleId: string;
  experienceLevel: 'junior' | 'mid' | 'senior';
  background: string;
  location: string;
  education: string;
  skills: UserSkill[];
  employmentHistory: EmploymentEntry[];
  certifications: string[];
  advice: string;
}

export interface UserProfile {
  skills: UserSkill[];
  employmentHistory: EmploymentEntry[];
  targetRole: string | null;
  learnedSkills: string[];
  resumeText: string;
}

export interface GapAnalysisResult {
  matchScore: number;
  mustHave: SkillGap[];
  recommended: SkillGap[];
  matched: SkillGap[];
}

export interface SkillGap {
  skillId: string;
  skillName: string;
  importance: 'must-have' | 'recommended';
  frequency: number;
  status: 'missing' | 'matched' | 'learned';
  resources?: SkillResource[];
  project?: string;
}

export interface SkillResource {
  title: string;
  url: string;
  type: 'free' | 'paid';
}

export interface ProfileComparison {
  profile: MockProfile;
  sharedSkills: string[];
  missingSkills: string[];
  uniqueSkills: string[];
  similarityScore: number;
}

export interface InterviewQuestion {
  id: string;
  skillId: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  modelAnswer: string;
}

