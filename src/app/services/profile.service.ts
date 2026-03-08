import { Injectable, signal, computed, effect } from '@angular/core';
import { UserProfile, UserSkill, EmploymentEntry } from '../models/types';

const STORAGE_KEY = 'skill-bridge-profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly _profile = signal<UserProfile>(this.loadProfile());

  readonly profile = this._profile.asReadonly();

  readonly skills = computed(() => this._profile().skills);
  readonly employmentHistory = computed(() => this._profile().employmentHistory);
  readonly targetRole = computed(() => this._profile().targetRole);
  readonly learnedSkills = computed(() => this._profile().learnedSkills);
  readonly resumeText = computed(() => this._profile().resumeText);

  constructor() {
    effect(() => {
      const profile = this._profile();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    });
  }

  private loadProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          skills: parsed.skills || [],
          employmentHistory: parsed.employmentHistory || [],
          targetRole: parsed.targetRole || null,
          learnedSkills: parsed.learnedSkills || [],
          resumeText: parsed.resumeText || '',
        };
      }
    } catch {}
    return {
      skills: [],
      employmentHistory: [],
      targetRole: null,
      learnedSkills: [],
      resumeText: '',
    };
  }

  setSkills(skills: UserSkill[]): void {
    this._profile.update(p => ({ ...p, skills }));
  }

  addSkill(skill: UserSkill): void {
    this._profile.update(p => {
      if (p.skills.some(s => s.skillId === skill.skillId)) return p;
      return { ...p, skills: [...p.skills, skill] };
    });
  }

  removeSkill(skillId: string): void {
    this._profile.update(p => ({
      ...p,
      skills: p.skills.filter(s => s.skillId !== skillId),
    }));
  }

  updateSkillProficiency(skillId: string, proficiency: UserSkill['proficiency']): void {
    this._profile.update(p => ({
      ...p,
      skills: p.skills.map(s =>
        s.skillId === skillId ? { ...s, proficiency } : s
      ),
    }));
  }

  setTargetRole(roleId: string): void {
    this._profile.update(p => ({ ...p, targetRole: roleId }));
  }

  addEmployment(entry: EmploymentEntry): void {
    this._profile.update(p => ({
      ...p,
      employmentHistory: [entry, ...p.employmentHistory],
    }));
  }

  removeEmployment(index: number): void {
    this._profile.update(p => ({
      ...p,
      employmentHistory: p.employmentHistory.filter((_, i) => i !== index),
    }));
  }

  setEmploymentHistory(history: EmploymentEntry[]): void {
    this._profile.update(p => ({ ...p, employmentHistory: history }));
  }

  toggleLearnedSkill(skillId: string): void {
    this._profile.update(p => {
      const learned = p.learnedSkills.includes(skillId)
        ? p.learnedSkills.filter(id => id !== skillId)
        : [...p.learnedSkills, skillId];
      return { ...p, learnedSkills: learned };
    });
  }

  isSkillLearned(skillId: string): boolean {
    return this._profile().learnedSkills.includes(skillId);
  }

  setResumeText(text: string): void {
    this._profile.update(p => ({ ...p, resumeText: text }));
  }

  resetProfile(): void {
    this._profile.set({
      skills: [],
      employmentHistory: [],
      targetRole: null,
      learnedSkills: [],
      resumeText: '',
    });
  }
}

