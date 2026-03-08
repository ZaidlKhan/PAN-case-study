import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MOCK_PROFILES } from '../../data/profiles.data';
import { ROLES } from '../../data/roles.data';
import { MockProfile } from '../../models/types';

interface FlowNode {
  id: string;
  label: string;
  count: number;
  type: 'education' | 'company' | 'role-entry' | 'target';
  profiles: string[]; // profile IDs
}

interface PathInsights {
  totalProfiles: number;
  educationBreakdown: { label: string; count: number; type: string }[];
  commonCompanies: { name: string; count: number }[];
  commonCerts: { name: string; count: number }[];
  commonPreviousRoles: { title: string; count: number }[];
  avgYearsToRole: number;
  hasNoDegree: number;
}

@Component({
  selector: 'app-paths',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Career Path Explorer</h1>
        <p class="text-gray-600 dark:text-gray-400">See how real professionals reached their dream role — where they studied, where they worked, and what path they took.</p>
      </div>

      <!-- Input -->
      <div class="card mb-8">
        <div class="flex flex-col sm:flex-row gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I want to be a...</label>
            <select [(ngModel)]="selectedRoleId" class="input-field">
              <option value="">Select a role</option>
              @for (role of roles; track role.id) {
                <option [value]="role.id">{{ role.title }}</option>
              }
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">at... (optional)</label>
            <input
              type="text"
              [(ngModel)]="companyFilter"
              placeholder="Any company"
              class="input-field"
            />
          </div>
        </div>
      </div>

      @if (selectedRoleId() && matchingProfiles().length > 0) {
        <!-- Insights Panel -->
        <div class="card mb-8">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            Path Insights
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              Based on {{ insights()!.totalProfiles }} professionals
            </span>
          </h2>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-2">Education</h3>
              <div class="space-y-1">
                @for (edu of insights()!.educationBreakdown.slice(0, 4); track edu.label) {
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-700 dark:text-gray-300 truncate">{{ edu.label }}</span>
                    <span class="text-blue-600 dark:text-blue-400 font-semibold ml-2 shrink-0">{{ edu.count }}</span>
                  </div>
                }
                @if (insights()!.hasNoDegree > 0) {
                  <div class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {{ insights()!.hasNoDegree }} got here without a CS degree
                  </div>
                }
              </div>
            </div>

            <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <h3 class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase mb-2">Worked At Before</h3>
              <div class="space-y-1">
                @for (comp of insights()!.commonCompanies.slice(0, 5); track comp.name) {
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-700 dark:text-gray-300 truncate">{{ comp.name }}</span>
                    <span class="text-indigo-600 dark:text-indigo-400 font-semibold ml-2 shrink-0">{{ comp.count }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h3 class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase mb-2">Previous Titles</h3>
              <div class="space-y-1">
                @for (role of insights()!.commonPreviousRoles.slice(0, 5); track role.title) {
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-700 dark:text-gray-300 truncate">{{ role.title }}</span>
                    <span class="text-purple-600 dark:text-purple-400 font-semibold ml-2 shrink-0">{{ role.count }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <h3 class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-2">Top Certifications</h3>
              <div class="space-y-1">
                @for (cert of insights()!.commonCerts.slice(0, 5); track cert.name) {
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-700 dark:text-gray-300 truncate">{{ cert.name }}</span>
                    <span class="text-emerald-600 dark:text-emerald-400 font-semibold ml-2 shrink-0">{{ cert.count }}</span>
                  </div>
                }
                @if (insights()!.commonCerts.length === 0) {
                  <p class="text-xs text-gray-400 italic">No common certifications</p>
                }
              </div>
            </div>
          </div>

          <div class="mt-4 text-center">
            <span class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5">
              Average time to reach this role: <strong class="text-gray-900 dark:text-white">{{ insights()!.avgYearsToRole }} years</strong>
            </span>
          </div>
        </div>

        <!-- Flow Diagram -->
        <div class="card mb-8">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Career Flow</h2>

          <!-- Target Role (Top) -->
          <div class="flex justify-center mb-8">
            <div class="bg-indigo-600 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg flex items-center gap-2">
              <span>{{ selectedRole()?.title }}</span>
              <span class="bg-white/20 text-sm px-2 py-0.5 rounded-full ml-1">{{ matchingProfiles().length }}</span>
            </div>
          </div>

          <div class="flex justify-center mb-2">
            <div class="w-0.5 h-6 bg-indigo-300 dark:bg-indigo-700"></div>
          </div>

          <!-- Current Companies Layer -->
          <div class="mb-2">
            <h3 class="text-xs font-semibold text-gray-400 uppercase text-center mb-3">Current Companies</h3>
            <div class="flex flex-wrap justify-center gap-2">
              @for (node of currentCompanyNodes(); track node.id) {
                <button
                  (click)="toggleHighlight(node.profiles)"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border"
                  [class]="isHighlighted(node.profiles)
                    ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:shadow-md'"
                >
                  {{ node.label }}
                  <span class="ml-1 text-xs opacity-70">({{ node.count }})</span>
                </button>
              }
            </div>
          </div>

          <div class="flex justify-center mb-2">
            <div class="w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
          </div>

          <!-- Previous Roles Layer -->
          <div class="mb-2">
            <h3 class="text-xs font-semibold text-gray-400 uppercase text-center mb-3">Previous Roles</h3>
            <div class="flex flex-wrap justify-center gap-2">
              @for (node of previousRoleNodes(); track node.id) {
                <button
                  (click)="toggleHighlight(node.profiles)"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border"
                  [class]="isHighlighted(node.profiles)
                    ? 'bg-purple-100 dark:bg-purple-900 border-purple-400 text-purple-700 dark:text-purple-300 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300 hover:shadow-md'"
                >
                  {{ node.label }}
                  <span class="ml-1 text-xs opacity-70">({{ node.count }})</span>
                </button>
              }
            </div>
          </div>

          <div class="flex justify-center mb-2">
            <div class="w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
          </div>

          <!-- Previous Companies Layer -->
          <div class="mb-2">
            <h3 class="text-xs font-semibold text-gray-400 uppercase text-center mb-3">Previous Companies</h3>
            <div class="flex flex-wrap justify-center gap-2">
              @for (node of previousCompanyNodes(); track node.id) {
                <button
                  (click)="toggleHighlight(node.profiles)"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border"
                  [class]="isHighlighted(node.profiles)
                    ? 'bg-amber-100 dark:bg-amber-900 border-amber-400 text-amber-700 dark:text-amber-300 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-300 hover:shadow-md'"
                >
                  {{ node.label }}
                  <span class="ml-1 text-xs opacity-70">({{ node.count }})</span>
                </button>
              }
            </div>
          </div>

          <div class="flex justify-center mb-2">
            <div class="w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
          </div>

          <!-- Education Layer -->
          <div>
            <h3 class="text-xs font-semibold text-gray-400 uppercase text-center mb-3">Education</h3>
            <div class="flex flex-wrap justify-center gap-2">
              @for (node of educationNodes(); track node.id) {
                <button
                  (click)="toggleHighlight(node.profiles)"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border"
                  [class]="isHighlighted(node.profiles)
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:shadow-md'"
                >
                  {{ node.label }}
                  <span class="ml-1 text-xs opacity-70">({{ node.count }})</span>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Individual Profile Timelines -->
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Individual Journeys</h2>
          <span class="text-sm text-gray-400">{{ filteredProfiles().length }} profiles</span>
        </div>

        <div class="space-y-4">
          @for (profile of filteredProfiles(); track profile.id) {
            <div
              class="card transition-all duration-200"
              [class]="highlightedProfiles().length > 0 && !highlightedProfiles().includes(profile.id)
                ? 'opacity-30'
                : ''"
            >
              <div class="flex items-start gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-lg shrink-0">
                  {{ profile.avatar }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ profile.name }}</h3>
                  <p class="text-sm text-indigo-600 dark:text-indigo-400">{{ profile.currentRole }} &#64; {{ profile.company }}</p>
                  <p class="text-xs text-gray-400">{{ profile.location }} · {{ profile.experienceLevel }}</p>
                </div>
                <span class="badge-blue text-xs">{{ profile.education.split(',')[0] }}</span>
              </div>

              <div class="relative pl-6 border-l-2 border-indigo-200 dark:border-indigo-800 ml-4 space-y-3">
                <div class="relative">
                  <div class="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-blue-400 border-2 border-white dark:border-gray-900"></div>
                  <div class="text-xs text-blue-600 dark:text-blue-400 font-semibold">Education</div>
                  <div class="text-sm text-gray-700 dark:text-gray-300">{{ profile.education }}</div>
                </div>

                @for (job of getReversedJobs(profile); track $index) {
                  <div class="relative">
                    <div class="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900"
                      [class]="job.current ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-500'"
                    ></div>
                    <div class="text-xs font-semibold" [class]="job.current ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'">
                      {{ job.title }}{{ job.current ? ' (current)' : '' }}
                    </div>
                    <div class="text-sm text-gray-700 dark:text-gray-300">{{ job.company }}</div>
                    <div class="text-xs text-gray-400">{{ job.startDate }} — {{ job.current ? 'Present' : job.endDate }}</div>
                  </div>
                }

                @if (profile.certifications.length > 0) {
                  <div class="relative">
                    <div class="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white dark:border-gray-900"></div>
                    <div class="text-xs text-amber-600 dark:text-amber-400 font-semibold">Certifications</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">{{ profile.certifications.join(', ') }}</div>
                  </div>
                }
              </div>

              <div class="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p class="text-sm text-gray-600 dark:text-gray-400 italic">"{{ profile.advice }}"</p>
              </div>
            </div>
          }
        </div>
      } @else if (selectedRoleId() && matchingProfiles().length === 0) {
        <div class="card text-center py-12">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No profiles found</h3>
          <p class="text-gray-500 dark:text-gray-400">Try a different role or clear the company filter.</p>
        </div>
      } @else {
        <div class="card text-center py-16">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a dream role to explore career paths</h3>
          <p class="text-gray-500 dark:text-gray-400">See how {{ MOCK_PROFILES.length }} professionals got to where they are today.</p>
        </div>
      }
    </div>
  `,
})
export class PathsComponent {
  roles = ROLES;
  MOCK_PROFILES = MOCK_PROFILES;

  selectedRoleId = signal('');
  companyFilter = signal('');
  highlightedProfiles = signal<string[]>([]);

  selectedRole = computed(() => {
    return ROLES.find(r => r.id === this.selectedRoleId()) || null;
  });

  matchingProfiles = computed(() => {
    const roleId = this.selectedRoleId();
    if (!roleId) return [];

    let profiles = MOCK_PROFILES.filter(p => p.targetRoleId === roleId);

    const company = this.companyFilter().trim().toLowerCase();
    if (company) {
      profiles = profiles.filter(p =>
        p.company.toLowerCase().includes(company) ||
        p.employmentHistory.some(j => j.company.toLowerCase().includes(company))
      );
    }

    return profiles;
  });

  filteredProfiles = computed(() => {
    return this.matchingProfiles();
  });

  // --- Flow diagram nodes ---

  educationNodes = computed(() => {
    return this.buildNodes(this.matchingProfiles(), p => {
      const edu = p.education;
      const parts = edu.split(',');
      const school = parts.length > 1 ? parts.slice(1).join(',').trim() : edu;
      return [school];
    }).slice(0, 4);
  });

  previousCompanyNodes = computed(() => {
    return this.buildNodes(this.matchingProfiles(), p => {
      return p.employmentHistory
        .filter(j => !j.current)
        .map(j => j.company)
        .filter(c => !c.toLowerCase().includes('bootcamp') && !c.toLowerCase().includes('university') && !c.toLowerCase().includes('college') && !c.toLowerCase().includes('freelance') && !c.toLowerCase().includes('school'));
    }).slice(0, 4);
  });

  previousRoleNodes = computed(() => {
    return this.buildNodes(this.matchingProfiles(), p => {
      return p.employmentHistory
        .filter(j => !j.current)
        .map(j => this.normalizeTitle(j.title));
    }).slice(0, 4);
  });

  currentCompanyNodes = computed(() => {
    return this.buildNodes(this.matchingProfiles(), p => {
      const current = p.employmentHistory.find(j => j.current);
      return current ? [current.company] : [];
    }).slice(0, 4);
  });

  insights = computed<PathInsights | null>(() => {
    const profiles = this.matchingProfiles();
    if (profiles.length === 0) return null;

    // Education breakdown
    const eduMap = new Map<string, { count: number; type: string }>();
    for (const p of profiles) {
      const edu = p.education;
      const degreeType = edu.includes('Ph.D') ? 'PhD' : edu.includes('M.S.') || edu.includes('M.Eng') ? 'Masters' : edu.includes('B.S.') || edu.includes('B.A.') || edu.includes('B.F.A') || edu.includes('B.Ed') || edu.includes('B.Com') ? 'Bachelors' : 'Other';
      const parts = edu.split(',');
      const school = parts.length > 1 ? parts.slice(1).join(',').trim() : edu;
      const existing = eduMap.get(school);
      if (existing) {
        existing.count++;
      } else {
        eduMap.set(school, { count: 1, type: degreeType });
      }
    }
    const educationBreakdown = Array.from(eduMap.entries())
      .map(([label, { count, type }]) => ({ label, count, type }))
      .sort((a, b) => b.count - a.count);

    // Common companies (previous, not current)
    const compMap = new Map<string, number>();
    for (const p of profiles) {
      const seen = new Set<string>();
      for (const j of p.employmentHistory) {
        if (!j.current && !seen.has(j.company)) {
          seen.add(j.company);
          compMap.set(j.company, (compMap.get(j.company) || 0) + 1);
        }
      }
    }
    const commonCompanies = Array.from(compMap.entries())
      .map(([name, count]) => ({ name, count }))
      .filter(c => c.count > 1 || profiles.length <= 3)
      .sort((a, b) => b.count - a.count);

    // Common previous role titles
    const roleMap = new Map<string, number>();
    for (const p of profiles) {
      const seen = new Set<string>();
      for (const j of p.employmentHistory) {
        if (!j.current) {
          const title = this.normalizeTitle(j.title);
          if (!seen.has(title)) {
            seen.add(title);
            roleMap.set(title, (roleMap.get(title) || 0) + 1);
          }
        }
      }
    }
    const commonPreviousRoles = Array.from(roleMap.entries())
      .map(([title, count]) => ({ title, count }))
      .filter(r => r.count > 1 || profiles.length <= 3)
      .sort((a, b) => b.count - a.count);

    // Common certs
    const certMap = new Map<string, number>();
    for (const p of profiles) {
      for (const cert of p.certifications) {
        certMap.set(cert, (certMap.get(cert) || 0) + 1);
      }
    }
    const commonCerts = Array.from(certMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Avg years to role
    let totalYears = 0;
    for (const p of profiles) {
      const sorted = [...p.employmentHistory].sort((a, b) => a.startDate.localeCompare(b.startDate));
      if (sorted.length >= 2) {
        const first = new Date(sorted[0].startDate + '-01');
        const current = sorted.find(j => j.current);
        const last = current ? new Date(current.startDate + '-01') : new Date(sorted[sorted.length - 1].startDate + '-01');
        totalYears += (last.getTime() - first.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      }
    }

    const hasNoDegree = profiles.filter(p =>
      !p.education.includes('B.S.') && !p.education.includes('M.S.') && !p.education.includes('Ph.D') &&
      !p.education.includes('B.A.') && !p.education.includes('M.Eng') && !p.education.includes('B.F.A') &&
      !p.education.includes('B.Ed') && !p.education.includes('B.Com')
    ).length;

    return {
      totalProfiles: profiles.length,
      educationBreakdown,
      commonCompanies,
      commonCerts,
      commonPreviousRoles,
      avgYearsToRole: Math.round((totalYears / profiles.length) * 10) / 10,
      hasNoDegree,
    };
  });

  // --- Helpers ---

  private buildNodes(profiles: MockProfile[], extractor: (p: MockProfile) => string[]): FlowNode[] {
    const map = new Map<string, { count: number; profiles: string[] }>();
    for (const p of profiles) {
      const values = extractor(p);
      const seen = new Set<string>();
      for (const val of values) {
        if (val && !seen.has(val)) {
          seen.add(val);
          const existing = map.get(val);
          if (existing) {
            existing.count++;
            existing.profiles.push(p.id);
          } else {
            map.set(val, { count: 1, profiles: [p.id] });
          }
        }
      }
    }
    return Array.from(map.entries())
      .map(([label, data]) => ({
        id: label,
        label,
        count: data.count,
        type: 'education' as const,
        profiles: data.profiles,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private normalizeTitle(title: string): string {
    // Simplify titles to group similar ones
    const t = title.toLowerCase();
    if (t.includes('intern')) return 'Intern';
    if (t.includes('teaching assistant') || t.includes('ta —')) return 'Teaching Assistant';
    if (t.includes('research')) return 'Researcher';
    if (t.includes('student') || t.includes('immersive')) return 'Bootcamp Student';
    if (t.includes('data analyst') || t.includes('business analyst') || t.includes('marketing analyst')) return 'Analyst';
    if (t.includes('qa') || t.includes('quality')) return 'QA Engineer';
    if (t.includes('sysadmin') || t.includes('systems admin')) return 'Systems Administrator';
    if (t.includes('help desk') || t.includes('it support') || t.includes('support technician')) return 'IT Support';
    if (t.includes('network engineer')) return 'Network Engineer';
    if (t.includes('sre') || t.includes('site reliability')) return 'SRE';
    if (t.includes('devops')) return 'DevOps Engineer';
    if (t.includes('frontend') || t.includes('front-end') || t.includes('ui developer') || t.includes('ux engineer')) return 'Frontend Developer';
    if (t.includes('backend') || t.includes('back-end')) return 'Backend Developer';
    if (t.includes('full-stack') || t.includes('fullstack') || t.includes('full stack')) return 'Full-Stack Developer';
    if (t.includes('software') && (t.includes('engineer') || t.includes('developer'))) return 'Software Engineer';
    if (t.includes('data scientist') || t.includes('applied scientist')) return 'Data Scientist';
    if (t.includes('ml engineer') || t.includes('deep learning')) return 'ML Engineer';
    if (t.includes('cloud')) return 'Cloud Engineer';
    if (t.includes('infrastructure')) return 'Infrastructure Engineer';
    if (t.includes('build') || t.includes('release')) return 'Build/Release Engineer';
    return title.replace(/\s*\(.*?\)\s*/g, '').trim(); // Remove parenthetical info
  }

  getReversedJobs(profile: MockProfile) {
    return [...profile.employmentHistory].reverse();
  }

  toggleHighlight(profileIds: string[]): void {
    const current = this.highlightedProfiles();
    // If clicking same set, clear
    if (current.length > 0 && current.every(id => profileIds.includes(id)) && profileIds.every(id => current.includes(id))) {
      this.highlightedProfiles.set([]);
    } else {
      this.highlightedProfiles.set(profileIds);
    }
  }

  isHighlighted(profileIds: string[]): boolean {
    const current = this.highlightedProfiles();
    if (current.length === 0) return false;
    return profileIds.some(id => current.includes(id));
  }
}

