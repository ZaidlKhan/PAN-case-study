import { Injectable, computed, inject } from '@angular/core';
import { ProfileService } from './profile.service';
import { MOCK_PROFILES } from '../data/profiles.data';
import { MockProfile, ProfileComparison } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ProfileComparisonService {
  private profileService = inject(ProfileService);

  readonly profilesForRole = computed<MockProfile[]>(() => {
    const roleId = this.profileService.targetRole();
    if (!roleId) return [];
    return MOCK_PROFILES.filter(p => p.targetRoleId === roleId);
  });

  readonly comparisons = computed<ProfileComparison[]>(() => {
    const profiles = this.profilesForRole();
    const userSkillIds = new Set(this.profileService.skills().map(s => s.skillId));

    return profiles.map(profile => {
      const profileSkillIds = new Set(profile.skills.map(s => s.skillId));

      const sharedSkills = [...userSkillIds].filter(id => profileSkillIds.has(id));
      const missingSkills = [...profileSkillIds].filter(id => !userSkillIds.has(id));
      const uniqueSkills = [...userSkillIds].filter(id => !profileSkillIds.has(id));

      // Jaccard similarity
      const union = new Set([...userSkillIds, ...profileSkillIds]);
      const similarityScore = union.size > 0
        ? Math.round((sharedSkills.length / union.size) * 100)
        : 0;

      return {
        profile,
        sharedSkills,
        missingSkills,
        uniqueSkills,
        similarityScore,
      };
    }).sort((a, b) => b.similarityScore - a.similarityScore);
  });

  readonly closestMatch = computed<ProfileComparison | null>(() => {
    const comparisons = this.comparisons();
    return comparisons.length > 0 ? comparisons[0] : null;
  });
}

