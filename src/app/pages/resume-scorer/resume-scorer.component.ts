import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GeminiService, AiAnalysis } from '../../services/gemini.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-resume-scorer',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Resume vs Job Description Scorer</h1>
        <p class="text-gray-400">Paste a job posting — AI will compare it against your profile resume and recommend next steps.</p>
      </div>

      @if (!geminiService.isConfigured()) {
        <div class="card bg-amber-900/20 border-amber-800 mb-8">
          <p class="text-sm text-amber-300">
            Add your Gemini API key to
            <code class="bg-amber-900 px-1.5 py-0.5 rounded text-xs font-mono">src/environments/environment.ts</code>
            to enable AI-powered resume analysis.
          </p>
        </div>
      }

      @if (!hasResume()) {
        <div class="card text-center py-12 mb-8">
          <p class="text-gray-400 mb-4">No resume found in your profile. Add your resume first to use the scorer.</p>
          <a routerLink="/profile" class="btn-primary">Go to Profile</a>
        </div>
      } @else {
        <div class="grid lg:grid-cols-2 gap-6 mb-8">
          <!-- Resume (read-only, from profile) -->
          <div class="card">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-semibold text-white">Your Resume</h2>
              <a routerLink="/profile" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Edit in Profile</a>
            </div>
            <div class="input-field h-64 overflow-y-auto font-mono text-sm text-gray-300 whitespace-pre-wrap">{{ profileService.resumeText() }}</div>
            <p class="text-xs text-gray-400 mt-1">{{ resumeWordCount() }} words</p>
          </div>

          <!-- Job Description -->
          <div class="card">
            <h2 class="text-lg font-semibold text-white mb-3">Job Description</h2>
            <textarea
              [(ngModel)]="jobText"
              placeholder="Paste the job description here..."
              class="input-field h-64 resize-y font-mono text-sm"
            ></textarea>
            <p class="text-xs text-gray-400 mt-1">{{ jobWordCount() }} words</p>
          </div>
        </div>

        <div class="flex justify-center mb-8">
          <button
            (click)="analyzeMatch()"
            [disabled]="!jobText() || loading() || !geminiService.isConfigured()"
            class="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading() ? 'Analyzing with AI...' : 'Analyze Match' }}
          </button>
        </div>
      }

      <!-- Loading State -->
      @if (loading()) {
        <div class="card text-center py-12">
          <div class="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-gray-400">AI is analyzing your resume against the job description...</p>
          <p class="text-gray-500 text-xs mt-1">This may take a few seconds</p>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="card bg-red-900/20 border-red-800 mb-6">
          <p class="text-sm text-red-300">{{ error() }}</p>
        </div>
      }

      <!-- Results -->
      @if (result()) {
        <div class="space-y-6">
          <!-- Score Circle -->
          <div class="card flex flex-col items-center text-center">
            <h3 class="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">ATS Match Score</h3>
            <div class="relative w-40 h-40 mb-4">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="stroke-gray-700" />
                <circle cx="60" cy="60" r="52" fill="none" stroke-width="10"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="circumference"
                  [attr.stroke-dashoffset]="dashOffset()"
                  [class]="scoreColor()" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-4xl font-bold text-white">{{ result()!.score }}%</span>
              </div>
            </div>
            <p class="text-sm text-gray-400 max-w-md">{{ result()!.scoreMessage }}</p>
          </div>

          <!-- Section Breakdown -->
          <div class="grid md:grid-cols-2 gap-4">
            @for (section of result()!.sections; track section.name) {
              <div class="card">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-semibold text-white">{{ section.name }}</h3>
                  <span class="text-sm font-bold" [class]="section.score / section.maxScore >= 0.7 ? 'text-emerald-400' : section.score / section.maxScore >= 0.4 ? 'text-amber-400' : 'text-red-400'">
                    {{ section.score }}/{{ section.maxScore }}
                  </span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div class="h-2 rounded-full transition-all"
                    [class]="section.score / section.maxScore >= 0.7 ? 'bg-emerald-500' : section.score / section.maxScore >= 0.4 ? 'bg-amber-500' : 'bg-red-500'"
                    [style.width.%]="(section.score / section.maxScore) * 100"
                  ></div>
                </div>
                <ul class="space-y-1">
                  @for (detail of section.details; track detail) {
                    <li class="text-xs text-gray-400">{{ detail }}</li>
                  }
                </ul>
              </div>
            }
          </div>

          <!-- Keywords -->
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card">
              <h3 class="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                Matched Keywords
                <span class="badge-green">{{ result()!.matchedKeywords.length }}</span>
              </h3>
              <div class="flex flex-wrap gap-1.5">
                @for (kw of result()!.matchedKeywords; track kw) {
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900 text-emerald-300">{{ kw }}</span>
                }
                @if (result()!.matchedKeywords.length === 0) {
                  <p class="text-xs text-gray-400 italic">No keyword matches found</p>
                }
              </div>
            </div>

            <div class="card">
              <h3 class="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                Missing Keywords
                <span class="badge-red">{{ result()!.missingKeywords.length }}</span>
              </h3>
              <div class="flex flex-wrap gap-1.5">
                @for (kw of result()!.missingKeywords; track kw) {
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">{{ kw }}</span>
                }
                @if (result()!.missingKeywords.length === 0) {
                  <p class="text-xs text-gray-400 italic">No missing keywords — great match!</p>
                }
              </div>
            </div>
          </div>

          <!-- Tips -->
          @if (result()!.tips.length > 0) {
            <div class="card">
              <h3 class="text-lg font-semibold text-white mb-4">How to Improve</h3>
              <div class="space-y-3">
                @for (tip of result()!.tips; track tip.text) {
                  <div class="flex items-start gap-3 p-3 rounded-lg"
                    [class]="tip.priority === 'high' ? 'bg-red-900/20 border border-red-800'
                      : tip.priority === 'medium' ? 'bg-amber-900/20 border border-amber-800'
                      : 'bg-gray-800/50 border border-gray-700'"
                  >
                    <span class="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                      [class]="tip.priority === 'high' ? 'bg-red-500 text-white'
                        : tip.priority === 'medium' ? 'bg-amber-500 text-white'
                        : 'bg-gray-400 text-white'"
                    >
                      {{ tip.priority === 'high' ? '!' : tip.priority === 'medium' ? '~' : '-' }}
                    </span>
                    <p class="text-sm text-gray-300">{{ tip.text }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Courses -->
          @if (result()!.courses.length > 0) {
            <div class="card">
              <h3 class="text-lg font-semibold text-white mb-4">Recommended Courses & Resources</h3>
              <div class="space-y-3">
                @for (course of result()!.courses; track course.title) {
                  <a [href]="course.url" target="_blank" rel="noopener"
                    class="block p-4 rounded-lg border border-gray-700 hover:border-indigo-600 hover:shadow-md transition-all group">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-sm font-semibold text-indigo-400 group-hover:underline">{{ course.title }}</span>
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                            [class]="course.free ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'"
                          >
                            {{ course.free ? 'Free' : 'Paid' }}
                          </span>
                        </div>
                        <p class="text-xs text-gray-400 mb-1">{{ course.provider }}</p>
                        <p class="text-xs text-gray-400">{{ course.reason }}</p>
                      </div>
                      <span class="text-gray-400 group-hover:text-indigo-400 transition-colors shrink-0">→</span>
                    </div>
                  </a>
                }
              </div>
            </div>
          }

          <!-- People -->
          @if (result()!.people.length > 0) {
            <div class="card">
              <h3 class="text-lg font-semibold text-white mb-2">People to Connect With</h3>
              <p class="text-xs text-gray-500 mb-4">Professionals in this space who might offer advice or mentorship.</p>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                @for (person of result()!.people; track person.name) {
                  <a [href]="person.linkedinUrl" target="_blank" rel="noopener"
                    class="block p-4 rounded-lg border border-gray-700 hover:border-blue-600 hover:shadow-md transition-all group">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">
                        {{ getInitials(person.name) }}
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{{ person.name }}</p>
                        <p class="text-xs text-gray-400 truncate">{{ person.title }}</p>
                      </div>
                    </div>
                    <p class="text-xs text-gray-400 mb-1.5">{{ person.company }}</p>
                    <p class="text-xs text-gray-400 italic">{{ person.reason }}</p>
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ResumeScorerComponent {
  geminiService = inject(GeminiService);
  profileService = inject(ProfileService);

  jobText = signal('');
  result = signal<AiAnalysis | null>(null);
  loading = signal(false);
  error = signal('');

  circumference = 2 * Math.PI * 52;

  hasResume = computed(() => !!this.profileService.resumeText()?.trim());

  resumeWordCount = computed(() => {
    const text = this.profileService.resumeText()?.trim() || '';
    return text ? text.split(/\s+/).length : 0;
  });

  jobWordCount = computed(() => {
    const text = this.jobText().trim();
    return text ? text.split(/\s+/).length : 0;
  });

  dashOffset = computed(() => {
    const score = this.result()?.score || 0;
    return this.circumference - (score / 100) * this.circumference;
  });

  scoreColor = computed(() => {
    const score = this.result()?.score || 0;
    if (score >= 75) return 'stroke-emerald-500';
    if (score >= 50) return 'stroke-amber-500';
    return 'stroke-red-500';
  });

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  async analyzeMatch(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    try {
      const analysis = await this.geminiService.analyzeResume(
        this.profileService.resumeText(),
        this.jobText()
      );
      this.result.set(analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
      this.error.set(
        err instanceof Error
          ? `Analysis failed: ${err.message}`
          : 'Analysis failed. Please check your API key and try again.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
