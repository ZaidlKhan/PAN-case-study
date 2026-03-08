import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileService);
  });

  afterEach(() => localStorage.clear());

  // -- Happy Path --

  it('should initialize with empty profile', () => {
    expect(service.skills()).toEqual([]);
    expect(service.employmentHistory()).toEqual([]);
    expect(service.targetRole()).toBeNull();
    expect(service.resumeText()).toBe('');
  });

  it('should add a skill', () => {
    service.addSkill({ skillId: 'python', proficiency: 'intermediate' });
    expect(service.skills().length).toBe(1);
    expect(service.skills()[0].skillId).toBe('python');
  });

  it('should set multiple skills at once', () => {
    service.setSkills([
      { skillId: 'python', proficiency: 'advanced' },
      { skillId: 'react', proficiency: 'beginner' },
    ]);
    expect(service.skills().length).toBe(2);
  });

  it('should remove a skill', () => {
    service.addSkill({ skillId: 'python', proficiency: 'intermediate' });
    service.addSkill({ skillId: 'react', proficiency: 'beginner' });
    service.removeSkill('python');
    expect(service.skills().length).toBe(1);
    expect(service.skills()[0].skillId).toBe('react');
  });

  it('should update skill proficiency', () => {
    service.addSkill({ skillId: 'python', proficiency: 'beginner' });
    service.updateSkillProficiency('python', 'advanced');
    expect(service.skills()[0].proficiency).toBe('advanced');
  });

  it('should set target role', () => {
    service.setTargetRole('cloud-engineer');
    expect(service.targetRole()).toBe('cloud-engineer');
  });

  it('should save resume text', () => {
    service.setResumeText('My resume content');
    expect(service.resumeText()).toBe('My resume content');
  });

  it('should add employment entry', () => {
    service.addEmployment({
      title: 'Software Engineer', company: 'Google',
      startDate: '2022-06', endDate: null, current: true,
      duties: ['Built APIs', 'Led team'],
    });
    expect(service.employmentHistory().length).toBe(1);
    expect(service.employmentHistory()[0].company).toBe('Google');
    expect(service.employmentHistory()[0].current).toBeTrue();
  });

  it('should toggle learned skills on and off', () => {
    service.toggleLearnedSkill('docker');
    expect(service.isSkillLearned('docker')).toBeTrue();
    service.toggleLearnedSkill('docker');
    expect(service.isSkillLearned('docker')).toBeFalse();
  });

  it('should reset profile completely', () => {
    service.addSkill({ skillId: 'python', proficiency: 'advanced' });
    service.setTargetRole('cloud-engineer');
    service.setResumeText('Some resume');
    service.resetProfile();
    expect(service.skills()).toEqual([]);
    expect(service.targetRole()).toBeNull();
    expect(service.resumeText()).toBe('');
  });

  // -- Edge Cases --

  it('should not add duplicate skills', () => {
    service.addSkill({ skillId: 'python', proficiency: 'beginner' });
    service.addSkill({ skillId: 'python', proficiency: 'advanced' });
    expect(service.skills().length).toBe(1);
    expect(service.skills()[0].proficiency).toBe('beginner');
  });

  it('should handle removing a non-existent skill', () => {
    service.addSkill({ skillId: 'python', proficiency: 'intermediate' });
    service.removeSkill('nonexistent');
    expect(service.skills().length).toBe(1);
  });

  it('should handle updating proficiency for non-existent skill', () => {
    service.updateSkillProficiency('nonexistent', 'advanced');
    expect(service.skills().length).toBe(0);
  });

  it('should handle empty resume text', () => {
    service.setResumeText('');
    expect(service.resumeText()).toBe('');
  });
});

