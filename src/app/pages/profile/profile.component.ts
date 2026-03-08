import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { GeminiService } from '../../services/gemini.service';
import { SKILLS } from '../../data/skills.data';
import { ROLES } from '../../data/roles.data';
import { Skill, UserSkill, EmploymentEntry } from '../../models/types';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Build Your Profile</h1>
        <p class="text-gray-600 dark:text-gray-400">Tell us where you are — paste your resume or add skills manually.</p>
      </div>

      <!-- Resume Paste Section -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Paste Your Resume</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Paste your resume text below and we'll extract your skills automatically.</p>
        <textarea
          [(ngModel)]="resumeText"
          placeholder="Paste your resume text here..."
          class="input-field h-40 resize-y font-mono text-sm"
        ></textarea>
        <div class="flex gap-3 mt-3">
          <button
            (click)="parseResume()"
            [disabled]="!resumeText() || parsing()"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ parsing() ? 'Parsing...' : 'Extract Skills' }}
          </button>
          <button
            (click)="resumeText.set('')"
            class="btn-secondary"
            [class.hidden]="!resumeText()"
          >
            Clear
          </button>
        </div>
        @if (parseError()) {
          <p class="text-red-500 text-sm mt-2">{{ parseError() }}</p>
        }
      </div>

      <!-- Target Role -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Target Role</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          @for (role of roles; track role.id) {
            <button
              (click)="selectRole(role.id)"
              class="p-4 rounded-xl border-2 transition-all text-left hover:shadow-md"
              [class]="profileService.targetRole() === role.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
            >
              <div class="text-2xl mb-1">{{ role.icon }}</div>
              <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ role.title }}</div>
            </button>
          }
        </div>
      </div>

      <!-- Manual Skill Entry -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Skills</h2>

        <!-- Search -->
        <div class="relative mb-4">
          <input
            type="text"
            [(ngModel)]="skillSearch"
            placeholder="Search and add skills (e.g., Python, React, Docker)..."
            class="input-field"
            (focus)="showDropdown.set(true)"
          />

          @if (showDropdown() && filteredSkills().length > 0) {
            <div class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              @for (skill of filteredSkills(); track skill.id) {
                <button
                  (click)="addSkill(skill)"
                  class="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-center justify-between transition-colors"
                >
                  <span class="text-sm text-gray-900 dark:text-white">{{ skill.name }}</span>
                  <span class="text-xs text-gray-400">{{ skill.category }}</span>
                </button>
              }
            </div>
          }
        </div>

        <!-- Skills List -->
        @if (profileService.skills().length > 0) {
          <div class="flex flex-wrap gap-2">
            @for (userSkill of profileService.skills(); track userSkill.skillId) {
              <div class="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-full pl-3 pr-1 py-1">
                <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  {{ getSkillName(userSkill.skillId) }}
                </span>
                <select
                  [ngModel]="userSkill.proficiency"
                  (ngModelChange)="updateProficiency(userSkill.skillId, $event)"
                  class="text-xs bg-transparent text-indigo-600 dark:text-indigo-400 border-none outline-none cursor-pointer"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button
                  (click)="removeSkill(userSkill.skillId)"
                  class="w-5 h-5 flex items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 hover:text-indigo-600 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        } @else {
          <p class="text-gray-400 dark:text-gray-500 text-sm italic">No skills added yet. Search above or paste your resume.</p>
        }
      </div>

      <!-- Employment History -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Employment History</h2>

        @for (job of profileService.employmentHistory(); track $index) {
          <div class="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
            <button
              (click)="removeEmployment($index)"
              class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors text-xs"
            >
              ✕
            </button>
            <div class="font-semibold text-gray-900 dark:text-white">{{ job.title }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ job.company }}</div>
            <div class="text-xs text-gray-400 mt-1">
              {{ job.startDate }} — {{ job.current ? 'Present' : job.endDate }}
            </div>
            @if (job.duties.length > 0) {
              <ul class="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                @for (duty of job.duties; track $index) {
                  <li>{{ duty }}</li>
                }
              </ul>
            }
          </div>
        }

        <!-- Add Employment Form -->
        @if (showEmploymentForm()) {
          <div class="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50/50 dark:bg-indigo-950/50">
            <div class="grid grid-cols-2 gap-3 mb-3">
              <input [(ngModel)]="newJob.title" placeholder="Job Title" class="input-field text-sm" />
              <input [(ngModel)]="newJob.company" placeholder="Company" class="input-field text-sm" />
              <input [(ngModel)]="newJob.startDate" placeholder="Start Date (YYYY-MM)" class="input-field text-sm" />
              <input [(ngModel)]="newJob.endDate" placeholder="End Date (or leave empty)" class="input-field text-sm" />
            </div>
            <div class="flex items-center gap-2 mb-3">
              <input type="checkbox" [(ngModel)]="newJob.current" id="current-job" class="rounded" />
              <label for="current-job" class="text-sm text-gray-600 dark:text-gray-400">I currently work here</label>
            </div>
            <textarea
              [(ngModel)]="newJob.dutiesText"
              placeholder="Job duties (one per line)"
              class="input-field h-24 text-sm resize-y mb-3"
            ></textarea>
            <div class="flex gap-2">
              <button (click)="saveEmployment()" class="btn-primary text-sm">Add Job</button>
              <button (click)="showEmploymentForm.set(false)" class="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        } @else {
          <button (click)="showEmploymentForm.set(true)" class="btn-secondary text-sm w-full">
            + Add Employment
          </button>
        }
      </div>

      <!-- Navigation -->
      <div class="flex justify-between items-center">
        <button (click)="resetProfile()" class="text-sm text-gray-400 hover:text-red-500 transition-colors">
          Reset Profile
        </button>
        <button
          (click)="goToDashboard()"
          [disabled]="profileService.skills().length === 0 || !profileService.targetRole()"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View Gap Analysis →
        </button>
      </div>
      @if (profileService.skills().length === 0 || !profileService.targetRole()) {
        <p class="text-right text-xs text-gray-400 mt-2">
          {{ profileService.skills().length === 0 ? 'Add at least one skill' : 'Select a target role' }} to continue
        </p>
      }
    </div>
  `,
})
export class ProfileComponent {
  profileService = inject(ProfileService);
  private geminiService = inject(GeminiService);
  private router = inject(Router);

  resumeText = signal(inject(ProfileService).resumeText() || '');
  skillSearch = signal('');
  showDropdown = signal(false);
  parsing = signal(false);
  parseError = signal('');
  showEmploymentForm = signal(false);

  roles = ROLES;
  allSkills = SKILLS;

  newJob = {
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    dutiesText: '',
  };

  filteredSkills = computed(() => {
    const search = this.skillSearch().toLowerCase().trim();
    if (!search) return [];
    const currentIds = new Set(this.profileService.skills().map(s => s.skillId));
    return this.allSkills
      .filter(s => !currentIds.has(s.id))
      .filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.category.toLowerCase().includes(search)
      )
      .slice(0, 10);
  });

  getSkillName(skillId: string): string {
    return this.allSkills.find(s => s.id === skillId)?.name || skillId;
  }

  addSkill(skill: Skill): void {
    this.profileService.addSkill({ skillId: skill.id, proficiency: 'intermediate' });
    this.skillSearch.set('');
    this.showDropdown.set(false);
  }

  removeSkill(skillId: string): void {
    this.profileService.removeSkill(skillId);
  }

  updateProficiency(skillId: string, proficiency: UserSkill['proficiency']): void {
    this.profileService.updateSkillProficiency(skillId, proficiency);
  }

  selectRole(roleId: string): void {
    this.profileService.setTargetRole(roleId);
  }

  saveEmployment(): void {
    const entry: EmploymentEntry = {
      title: this.newJob.title,
      company: this.newJob.company,
      startDate: this.newJob.startDate,
      endDate: this.newJob.current ? null : this.newJob.endDate || null,
      current: this.newJob.current,
      duties: this.newJob.dutiesText.split('\n').map(d => d.trim()).filter(d => d.length > 0),
    };
    this.profileService.addEmployment(entry);
    this.newJob = { title: '', company: '', startDate: '', endDate: '', current: false, dutiesText: '' };
    this.showEmploymentForm.set(false);
  }

  removeEmployment(index: number): void {
    this.profileService.removeEmployment(index);
  }

  async parseResume(): Promise<void> {
    this.parsing.set(true);
    this.parseError.set('');

    // Save resume text to profile
    this.profileService.setResumeText(this.resumeText());

    if (this.geminiService.isConfigured()) {
      // AI-powered parsing
      try {
        const result = await this.geminiService.parseResume(this.resumeText());

        if (result.skills.length > 0) {
          this.profileService.setSkills(result.skills);
        } else {
          this.parseError.set('AI could not extract skills. Try adding them manually below.');
        }

        if (result.employmentHistory.length > 0) {
          this.profileService.setEmploymentHistory(result.employmentHistory);
        }
      } catch (err) {
        console.error('AI parse failed, falling back to keyword extraction:', err);
        this.fallbackParseResume();
      }
    } else {
      // Fallback: keyword-based skill extraction
      this.fallbackParseResume();
    }

    this.parsing.set(false);
  }

  private fallbackParseResume(): void {
    const text = this.resumeText().toLowerCase();
    const foundSkills: UserSkill[] = [];

    for (const skill of this.allSkills) {
      const nameLC = skill.name.toLowerCase();
      const variations = [nameLC, skill.id];
      if (variations.some(v => text.includes(v))) {
        foundSkills.push({ skillId: skill.id, proficiency: 'intermediate' });
      }
    }

    if (foundSkills.length > 0) {
      this.profileService.setSkills(foundSkills);
    } else {
      this.parseError.set('No skills found. Try adding them manually below.');
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  resetProfile(): void {
    if (confirm('Reset your entire profile? This cannot be undone.')) {
      this.profileService.resetProfile();
    }
  }
}

