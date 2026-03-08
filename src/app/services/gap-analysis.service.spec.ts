import { TestBed } from '@angular/core/testing';
import { GapAnalysisService } from './gap-analysis.service';
import { ProfileService } from './profile.service';

describe('GapAnalysisService', () => {
  let service: GapAnalysisService;
  let profileService: ProfileService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(GapAnalysisService);
    profileService = TestBed.inject(ProfileService);
  });

  afterEach(() => localStorage.clear());

  // -- Happy Path --

  it('should return null analysis when no target role selected', () => {
    expect(service.analysis()).toBeNull();
    expect(service.selectedRole()).toBeNull();
  });

  it('should return a role when target role is set', () => {
    profileService.setTargetRole('cloud-engineer');
    expect(service.selectedRole()).not.toBeNull();
    expect(service.selectedRole()!.id).toBe('cloud-engineer');
  });

  it('should compute gap analysis with matched skills', () => {
    profileService.setTargetRole('frontend-dev');
    profileService.setSkills([
      { skillId: 'javascript', proficiency: 'advanced' },
      { skillId: 'react', proficiency: 'intermediate' },
      { skillId: 'html', proficiency: 'advanced' },
      { skillId: 'css', proficiency: 'advanced' },
    ]);
    const analysis = service.analysis();
    expect(analysis).not.toBeNull();
    expect(analysis!.matched.length).toBeGreaterThan(0);
    expect(analysis!.matchScore).toBeGreaterThan(0);
  });

  it('should identify missing must-have skills', () => {
    profileService.setTargetRole('cloud-engineer');
    profileService.setSkills([]); // no skills at all
    const analysis = service.analysis();
    expect(analysis).not.toBeNull();
    expect(analysis!.mustHave.length).toBeGreaterThan(0);
    expect(analysis!.matchScore).toBe(0);
  });

  it('should give 100% match when all required skills present', () => {
    profileService.setTargetRole('frontend-dev');
    const role = service.selectedRole()!;
    const allSkills = role.requirements.map(r => ({
      skillId: r.skillId,
      proficiency: 'advanced' as const,
    }));
    profileService.setSkills(allSkills);
    const analysis = service.analysis();
    expect(analysis!.matchScore).toBe(100);
    expect(analysis!.mustHave.length).toBe(0);
    expect(analysis!.recommended.length).toBe(0);
  });

  it('should sort must-have gaps by frequency descending', () => {
    profileService.setTargetRole('cloud-engineer');
    profileService.setSkills([]);
    const analysis = service.analysis()!;
    for (let i = 1; i < analysis.mustHave.length; i++) {
      expect(analysis.mustHave[i - 1].frequency).toBeGreaterThanOrEqual(analysis.mustHave[i].frequency);
    }
  });

  it('should generate radar data when role is selected', () => {
    profileService.setTargetRole('frontend-dev');
    profileService.setSkills([{ skillId: 'javascript', proficiency: 'advanced' }]);
    const radar = service.radarData();
    expect(radar).not.toBeNull();
    expect(radar!.labels.length).toBeGreaterThan(0);
    expect(radar!.roleData.length).toBe(radar!.labels.length);
    expect(radar!.userData.length).toBe(radar!.labels.length);
  });


  // -- Edge Cases --

  it('should return null analysis for invalid role id', () => {
    profileService.setTargetRole('nonexistent-role');
    expect(service.selectedRole()).toBeNull();
    expect(service.analysis()).toBeNull();
  });

  it('should return null radar data when no role selected', () => {
    expect(service.radarData()).toBeNull();
  });

  it('should count learned skills as matched', () => {
    profileService.setTargetRole('frontend-dev');
    profileService.setSkills([]);
    const before = service.analysis()!;
    const mustHaveSkill = before.mustHave[0]?.skillId;
    if (mustHaveSkill) {
      profileService.toggleLearnedSkill(mustHaveSkill);
      const after = service.analysis()!;
      expect(after.matched.length).toBe(before.matched.length + 1);
      expect(after.mustHave.length).toBe(before.mustHave.length - 1);
    }
  });
});

