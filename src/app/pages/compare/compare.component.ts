import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { ProfileComparisonService } from '../../services/profile-comparison.service';
import { SKILLS } from '../../data/skills.data';
import { ProfileComparison, MockProfile } from '../../models/types';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      @if (!profileService.targetRole()) {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">👤</div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Target Role Selected</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Set up your profile and pick a target role first.</p>
          <a routerLink="/profile" class="btn-primary">Go to Profile →</a>
        </div>
      } @else if (comparisonService.profilesForRole().length === 0) {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">🔍</div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Profiles Found</h2>
          <p class="text-gray-500 dark:text-gray-400">We don't have mocked profiles for this role yet.</p>
        </div>
      } @else {
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Compare with Professionals</h1>
          <p class="text-gray-600 dark:text-gray-400">See how your skills stack up against real professionals in your target role.</p>
        </div>

        <!-- Closest Match Banner -->
        @if (comparisonService.closestMatch(); as closest) {
          <div class="card mb-8 border-l-4 border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30">
            <div class="flex items-start gap-4">
              <div class="text-4xl">{{ closest.profile.avatar }}</div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Closest Match</span>
                  <span class="badge-blue">{{ closest.similarityScore }}% similar</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                  You're closest to {{ closest.profile.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ closest.profile.currentRole }} at {{ closest.profile.company }} · {{ closest.profile.background }}
                </p>
                @if (closest.missingSkills.length > 0) {
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Bridge the gap by learning:
                    <span class="font-medium text-indigo-600 dark:text-indigo-400">
                      {{ getMissingSkillNames(closest.missingSkills).join(', ') }}
                    </span>
                  </p>
                }
              </div>
            </div>
          </div>
        }

        <!-- Profile Cards Grid -->
        <div class="grid md:grid-cols-2 gap-6">
          @for (comparison of comparisonService.comparisons(); track comparison.profile.id) {
            <div
              class="card cursor-pointer hover:shadow-lg transition-all duration-200 border-2"
              [class]="selectedProfile()?.id === comparison.profile.id
                ? 'border-indigo-500 shadow-md'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'"
              (click)="selectProfile(comparison)"
            >
              <!-- Profile Header -->
              <div class="flex items-start gap-3 mb-4">
                <div class="text-3xl">{{ comparison.profile.avatar }}</div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">{{ comparison.profile.name }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ comparison.profile.currentRole }} at {{ comparison.profile.company }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ comparison.profile.location }} · {{ comparison.profile.experienceLevel }}</p>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-2xl font-bold" [class]="getSimilarityColor(comparison.similarityScore)">
                    {{ comparison.similarityScore }}%
                  </div>
                  <div class="text-xs text-gray-400">match</div>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {{ comparison.sharedSkills.length }} shared
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-red-400"></span>
                  {{ comparison.missingSkills.length }} they have
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                  {{ comparison.uniqueSkills.length }} you have
                </span>
              </div>

              <!-- Background -->
              <p class="text-sm text-gray-500 dark:text-gray-400 italic">
                "{{ comparison.profile.advice }}"
              </p>
            </div>
          }
        </div>

        <!-- Selected Profile Detail -->
        @if (selectedComparison(); as comp) {
          <div class="mt-8 space-y-6">
            <!-- Skill Comparison -->
            <div class="card">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                {{ comp.profile.avatar }} {{ comp.profile.name }} — Skill Comparison
              </h3>

              <div class="grid md:grid-cols-3 gap-6">
                <!-- Shared Skills -->
                <div>
                  <h4 class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-3 flex items-center gap-2">
                    🟢 Shared Skills
                    <span class="badge-green">{{ comp.sharedSkills.length }}</span>
                  </h4>
                  <div class="flex flex-wrap gap-1.5">
                    @for (skillId of comp.sharedSkills; track skillId) {
                      <span class="skill-tag bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                        ✓ {{ getSkillName(skillId) }}
                      </span>
                    }
                    @if (comp.sharedSkills.length === 0) {
                      <p class="text-sm text-gray-400 italic">None yet</p>
                    }
                  </div>
                </div>

                <!-- They Have, You Don't -->
                <div>
                  <h4 class="text-sm font-semibold text-red-600 dark:text-red-400 uppercase mb-3 flex items-center gap-2">
                    🔴 They Have, You Don't
                    <span class="badge-red">{{ comp.missingSkills.length }}</span>
                  </h4>
                  <div class="flex flex-wrap gap-1.5">
                    @for (skillId of comp.missingSkills; track skillId) {
                      <span class="skill-tag bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs">
                        ✗ {{ getSkillName(skillId) }}
                      </span>
                    }
                    @if (comp.missingSkills.length === 0) {
                      <p class="text-sm text-gray-400 italic">You have everything they have!</p>
                    }
                  </div>
                </div>

                <!-- You Have, They Don't -->
                <div>
                  <h4 class="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase mb-3 flex items-center gap-2">
                    🔵 Your Unique Skills
                    <span class="badge-blue">{{ comp.uniqueSkills.length }}</span>
                  </h4>
                  <div class="flex flex-wrap gap-1.5">
                    @for (skillId of comp.uniqueSkills; track skillId) {
                      <span class="skill-tag bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                        ★ {{ getSkillName(skillId) }}
                      </span>
                    }
                    @if (comp.uniqueSkills.length === 0) {
                      <p class="text-sm text-gray-400 italic">None — but that's OK!</p>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Employment Timeline -->
            <div class="card">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">💼 Career Timeline</h3>

              <div class="flex items-center gap-3 mb-6">
                <span class="text-sm text-gray-500 dark:text-gray-400">🎓 {{ comp.profile.education }}</span>
                @if (comp.profile.certifications.length > 0) {
                  <span class="text-gray-300 dark:text-gray-600">·</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    📜 {{ comp.profile.certifications.join(', ') }}
                  </span>
                }
              </div>

              <div class="relative">
                <!-- Timeline line -->
                <div class="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                @for (job of comp.profile.employmentHistory; track $index) {
                  <div class="relative pl-10 pb-8 last:pb-0">
                    <!-- Timeline dot -->
                    <div
                      class="absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2"
                      [class]="job.current
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'"
                    ></div>

                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div class="flex items-start justify-between mb-1">
                        <div>
                          <h4 class="font-semibold text-gray-900 dark:text-white">{{ job.title }}</h4>
                          <p class="text-sm text-gray-600 dark:text-gray-400">{{ job.company }}</p>
                        </div>
                        <div class="text-right shrink-0">
                          <span class="text-xs text-gray-400">
                            {{ job.startDate }} — {{ job.current ? 'Present' : job.endDate }}
                          </span>
                          @if (job.current) {
                            <span class="badge-green ml-2">Current</span>
                          }
                        </div>
                      </div>

                      @if (job.duties.length > 0) {
                        <ul class="mt-2 space-y-1">
                          @for (duty of job.duties; track $index) {
                            <li class="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span class="text-gray-300 dark:text-gray-600 mt-1">•</span>
                              <span>{{ duty }}</span>
                            </li>
                          }
                        </ul>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Advice -->
            <div class="card bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
              <div class="flex items-start gap-3">
                <div class="text-2xl">💬</div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Advice from {{ comp.profile.name }}</h4>
                  <p class="text-gray-700 dark:text-gray-300 italic">"{{ comp.profile.advice }}"</p>
                </div>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class CompareComponent {
  profileService = inject(ProfileService);
  comparisonService = inject(ProfileComparisonService);

  selectedProfile = signal<MockProfile | null>(null);
  selectedComparison = signal<ProfileComparison | null>(null);

  getSkillName(skillId: string): string {
    return SKILLS.find(s => s.id === skillId)?.name || skillId;
  }

  getMissingSkillNames(skillIds: string[]): string[] {
    return skillIds.slice(0, 5).map(id => this.getSkillName(id));
  }

  getSimilarityColor(score: number): string {
    if (score >= 60) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 35) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }

  selectProfile(comparison: ProfileComparison): void {
    if (this.selectedProfile()?.id === comparison.profile.id) {
      this.selectedProfile.set(null);
      this.selectedComparison.set(null);
    } else {
      this.selectedProfile.set(comparison.profile);
      this.selectedComparison.set(comparison);
    }
  }
}

