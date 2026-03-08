import { Injectable, computed, inject } from '@angular/core';
import { ProfileService } from './profile.service';
import { ROLES } from '../data/roles.data';
import { SKILLS } from '../data/skills.data';
import { SKILL_RESOURCES } from '../data/resources.data';
import { GapAnalysisResult, SkillGap, Role } from '../models/types';

@Injectable({ providedIn: 'root' })
export class GapAnalysisService {
  private profileService = inject(ProfileService);

  readonly selectedRole = computed<Role | null>(() => {
    const roleId = this.profileService.targetRole();
    return ROLES.find(r => r.id === roleId) || null;
  });

  readonly analysis = computed<GapAnalysisResult | null>(() => {
    const role = this.selectedRole();
    if (!role) return null;

    const userSkillIds = new Set(this.profileService.skills().map(s => s.skillId));
    const learnedSkills = new Set(this.profileService.learnedSkills());

    const mustHave: SkillGap[] = [];
    const recommended: SkillGap[] = [];
    const matched: SkillGap[] = [];

    for (const req of role.requirements) {
      const skill = SKILLS.find(s => s.id === req.skillId);
      const skillName = skill?.name || req.skillId;
      const resourceData = SKILL_RESOURCES[req.skillId];

      const hasSkill = userSkillIds.has(req.skillId);
      const hasLearned = learnedSkills.has(req.skillId);

      const gap: SkillGap = {
        skillId: req.skillId,
        skillName,
        importance: req.importance,
        frequency: req.frequency,
        status: hasSkill || hasLearned ? (hasLearned ? 'learned' : 'matched') : 'missing',
        resources: resourceData?.resources,
        project: resourceData?.project,
      };

      if (hasSkill || hasLearned) {
        matched.push(gap);
      } else if (req.importance === 'must-have') {
        mustHave.push(gap);
      } else {
        recommended.push(gap);
      }
    }

    // Sort by frequency descending
    mustHave.sort((a, b) => b.frequency - a.frequency);
    recommended.sort((a, b) => b.frequency - a.frequency);

    const totalRequirements = role.requirements.length;
    const matchedCount = matched.length;
    const matchScore = totalRequirements > 0
      ? Math.round((matchedCount / totalRequirements) * 100)
      : 0;

    return { matchScore, mustHave, recommended, matched };
  });

  readonly radarData = computed(() => {
    const role = this.selectedRole();
    if (!role) return null;

    const userSkillIds = new Set(this.profileService.skills().map(s => s.skillId));
    const learnedSkills = new Set(this.profileService.learnedSkills());

    // Group requirements by category
    const categoryScores: Record<string, { required: number; matched: number }> = {};

    for (const req of role.requirements) {
      const skill = SKILLS.find(s => s.id === req.skillId);
      const category = skill?.category || 'Other';
      if (!categoryScores[category]) {
        categoryScores[category] = { required: 0, matched: 0 };
      }
      categoryScores[category].required += req.frequency;
      if (userSkillIds.has(req.skillId) || learnedSkills.has(req.skillId)) {
        categoryScores[category].matched += req.frequency;
      }
    }

    const labels = Object.keys(categoryScores);
    const roleData = labels.map(l => 100);
    const userData = labels.map(l => {
      const cat = categoryScores[l];
      return cat.required > 0 ? Math.round((cat.matched / cat.required) * 100) : 0;
    });

    return { labels, roleData, userData };
  });

  getRoles(): Role[] {
    return ROLES;
  }
}

