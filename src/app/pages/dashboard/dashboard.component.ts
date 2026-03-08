import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { GapAnalysisService } from '../../services/gap-analysis.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      @if (!gapService.selectedRole()) {
        <div class="text-center py-20">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Target Role Selected</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Set up your profile first to see your gap analysis.</p>
          <a routerLink="/profile" class="btn-primary">Go to Profile →</a>
        </div>
      } @else {
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Gap Analysis</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Your skills vs. <span class="font-semibold text-indigo-600 dark:text-indigo-400">{{ gapService.selectedRole()!.title }}</span> requirements
          </p>
        </div>

        <!-- Match Score + Radar -->
        <div class="grid lg:grid-cols-2 gap-6 mb-8">
          <!-- Match Score Card -->
          <div class="card flex flex-col items-center justify-center text-center">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Match Score</h3>
            <div class="relative w-40 h-40 mb-4">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke-width="10"
                  class="stroke-gray-200 dark:stroke-gray-700" />
                <circle cx="60" cy="60" r="52" fill="none" stroke-width="10"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="circumference"
                  [attr.stroke-dashoffset]="dashOffset()"
                  [class]="matchScoreColor()" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-4xl font-bold text-gray-900 dark:text-white">
                  {{ analysis()?.matchScore || 0 }}%
                </span>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              {{ matchScoreMessage() }}
            </p>
          </div>

          <!-- Radar Chart -->
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider text-center">Skills Radar</h3>
            <div class="w-full aspect-square max-w-sm mx-auto">
              <canvas #radarCanvas></canvas>
            </div>
          </div>
        </div>

        <!-- Skill Gap Lists -->
        <div class="space-y-6">
          <!-- Must-Have Gaps -->
          @if (analysis()?.mustHave?.length) {
            <div class="card">
              <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                Must-Have Skills You're Missing
                <span class="badge-red">{{ analysis()!.mustHave.length }}</span>
              </h3>
              <div class="space-y-3">
                @for (gap of analysis()!.mustHave; track gap.skillId) {
                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      (click)="toggleExpand(gap.skillId)"
                      class="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div class="flex items-center gap-3">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ gap.skillName }}</span>
                        <span class="text-xs text-gray-400">{{ gap.frequency }}% of job postings</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          (click)="$event.stopPropagation(); toggleLearned(gap.skillId)"
                          class="text-xs px-2 py-1 rounded-md transition-colors"
                          [class]="profileService.isSkillLearned(gap.skillId)
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-emerald-50'"
                        >
                          {{ profileService.isSkillLearned(gap.skillId) ? '✓ Learned' : '☐ Mark as Learned' }}
                        </button>
                        <span class="text-gray-400 text-xs">{{ expandedSkill() === gap.skillId ? '▲' : '▼' }}</span>
                      </div>
                    </button>
                    @if (expandedSkill() === gap.skillId && gap.resources) {
                      <div class="px-4 pb-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        <div class="grid md:grid-cols-2 gap-4 pt-3">
                          <div>
                            <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">Resources</h4>
                            @for (res of gap.resources; track res.url) {
                              <a [href]="res.url" target="_blank" class="block text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-1">
                                {{ res.title }} <span class="text-xs text-gray-400">({{ res.type }})</span>
                              </a>
                            }
                          </div>
                          @if (gap.project) {
                            <div>
                              <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">Project Idea</h4>
                              <p class="text-sm text-gray-600 dark:text-gray-400">{{ gap.project }}</p>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Recommended Gaps -->
          @if (analysis()?.recommended?.length) {
            <div class="card">
              <h3 class="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                Recommended Skills
                <span class="badge-yellow">{{ analysis()!.recommended.length }}</span>
              </h3>
              <div class="space-y-3">
                @for (gap of analysis()!.recommended; track gap.skillId) {
                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      (click)="toggleExpand(gap.skillId)"
                      class="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div class="flex items-center gap-3">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ gap.skillName }}</span>
                        <span class="text-xs text-gray-400">{{ gap.frequency }}% of job postings</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          (click)="$event.stopPropagation(); toggleLearned(gap.skillId)"
                          class="text-xs px-2 py-1 rounded-md transition-colors"
                          [class]="profileService.isSkillLearned(gap.skillId)
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-emerald-50'"
                        >
                          {{ profileService.isSkillLearned(gap.skillId) ? '✓ Learned' : '☐ Mark as Learned' }}
                        </button>
                        <span class="text-gray-400 text-xs">{{ expandedSkill() === gap.skillId ? '▲' : '▼' }}</span>
                      </div>
                    </button>
                    @if (expandedSkill() === gap.skillId && gap.resources) {
                      <div class="px-4 pb-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        <div class="grid md:grid-cols-2 gap-4 pt-3">
                          <div>
                            <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">Resources</h4>
                            @for (res of gap.resources; track res.url) {
                              <a [href]="res.url" target="_blank" class="block text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-1">
                                {{ res.title }} <span class="text-xs text-gray-400">({{ res.type }})</span>
                              </a>
                            }
                          </div>
                          @if (gap.project) {
                            <div>
                              <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">Project Idea</h4>
                              <p class="text-sm text-gray-600 dark:text-gray-400">{{ gap.project }}</p>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Matched Skills -->
          @if (analysis()?.matched?.length) {
            <div class="card">
              <h3 class="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                Skills You Have
                <span class="badge-green">{{ analysis()!.matched.length }}</span>
              </h3>
              <div class="flex flex-wrap gap-2">
                @for (gap of analysis()!.matched; track gap.skillId) {
                  <span class="skill-tag bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    ✓ {{ gap.skillName }}
                  </span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Nav to Compare -->
        <div class="flex justify-end mt-8">
          <a routerLink="/paths" class="btn-primary">
            Explore Career Paths →
          </a>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  profileService = inject(ProfileService);
  gapService = inject(GapAnalysisService);

  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  expandedSkill = signal<string | null>(null);

  analysis = this.gapService.analysis;
  circumference = 2 * Math.PI * 52;

  dashOffset = computed(() => {
    const score = this.analysis()?.matchScore || 0;
    return this.circumference - (score / 100) * this.circumference;
  });

  matchScoreColor = computed(() => {
    const score = this.analysis()?.matchScore || 0;
    if (score >= 75) return 'stroke-emerald-500';
    if (score >= 50) return 'stroke-amber-500';
    return 'stroke-red-500';
  });

  matchScoreMessage = computed(() => {
    const score = this.analysis()?.matchScore || 0;
    if (score >= 85) return 'Excellent! You\'re highly competitive for this role.';
    if (score >= 70) return 'Strong match! A few more skills will make you stand out.';
    if (score >= 50) return 'Good foundation. Focus on the must-have skills first.';
    if (score >= 25) return 'Getting there! Prioritize the red skills below.';
    return 'Early stage — but everyone starts somewhere. Let\'s build your path!';
  });

  constructor() {
    effect(() => {
      const radarData = this.gapService.radarData();
      if (radarData && this.radarCanvas) {
        this.renderChart(radarData);
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      const radarData = this.gapService.radarData();
      if (radarData && this.radarCanvas) {
        this.renderChart(radarData);
      }
    }, 100);
  }

  private renderChart(data: { labels: string[]; roleData: number[]; userData: number[] }): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const labelColor = isDark ? '#9ca3af' : '#6b7280';

    this.chart = new Chart(this.radarCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Role Requirements',
            data: data.roleData,
            borderColor: 'rgba(99, 102, 241, 0.6)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(99, 102, 241, 0.8)',
            pointRadius: 3,
          },
          {
            label: 'Your Skills',
            data: data.userData,
            borderColor: 'rgba(16, 185, 129, 0.8)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 25, color: labelColor, backdropColor: 'transparent' },
            grid: { color: gridColor },
            angleLines: { color: gridColor },
            pointLabels: { color: labelColor, font: { size: 11 } },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: labelColor, padding: 16, usePointStyle: true },
          },
        },
      },
    });
  }

  toggleExpand(skillId: string): void {
    this.expandedSkill.update(current => current === skillId ? null : skillId);
  }

  toggleLearned(skillId: string): void {
    this.profileService.toggleLearnedSkill(skillId);
  }
}

