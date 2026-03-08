import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { GapAnalysisService } from '../../services/gap-analysis.service';
import { SKILLS } from '../../data/skills.data';
import { INTERVIEW_QUESTIONS } from '../../data/interview.data';

interface QuestionState {
  questionId: string;
  skillId: string;
  skillName: string;
  question: string;
  difficulty: string;
  modelAnswer: string;
  userAnswer: string;
  showAnswer: boolean;
  submitted: boolean;
}

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      @if (!profileService.targetRole()) {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">🎤</div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Target Role Selected</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Set up your profile first to practice interview questions.</p>
          <a routerLink="/profile" class="btn-primary">Go to Profile →</a>
        </div>
      } @else if (!started()) {
        <!-- Start Screen -->
        <div class="text-center py-16">
          <div class="text-6xl mb-6">🎤</div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">Mock Interview</h1>
          <p class="text-gray-600 dark:text-gray-400 mb-2 max-w-lg mx-auto">
            Practice technical questions targeting your <strong class="text-indigo-600 dark:text-indigo-400">skill gaps</strong> for the
            {{ gapService.selectedRole()?.title }} role.
          </p>
          <p class="text-sm text-gray-400 mb-8">
            {{ availableQuestions().length }} questions available based on your gap analysis
          </p>
          <button
            (click)="startInterview()"
            [disabled]="availableQuestions().length === 0"
            class="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Practice Session ({{ Math.min(5, availableQuestions().length) }} questions) →
          </button>
          @if (availableQuestions().length === 0) {
            <p class="text-sm text-amber-500 mt-4">No questions available — you may have matched all required skills!</p>
          }
        </div>
      } @else {
        <!-- Interview In Progress -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mock Interview</h1>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ answeredCount() }}/{{ sessionQuestions().length }} answered
              </span>
              <button (click)="resetInterview()" class="btn-secondary text-sm">
                Start Over
              </button>
            </div>
          </div>
          <!-- Progress bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              [style.width.%]="progressPercent()"
            ></div>
          </div>
        </div>

        <!-- Questions -->
        <div class="space-y-6">
          @for (q of sessionQuestions(); track q.questionId; let i = $index) {
            <div class="card">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-400">Q{{ i + 1 }}</span>
                  <span class="badge-blue">{{ q.skillName }}</span>
                  <span
                    class="badge"
                    [class]="q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'medium' ? 'badge-yellow' : 'badge-red'"
                  >
                    {{ q.difficulty }}
                  </span>
                </div>
                @if (q.submitted) {
                  <span class="badge-green">✓ Answered</span>
                }
              </div>

              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ q.question }}</h3>

              <!-- Answer Input -->
              <textarea
                [(ngModel)]="q.userAnswer"
                [disabled]="q.submitted"
                placeholder="Type your answer here..."
                class="input-field h-32 resize-y text-sm mb-3"
                [class]="q.submitted ? 'opacity-70' : ''"
              ></textarea>

              <div class="flex items-center gap-3">
                @if (!q.submitted) {
                  <button
                    (click)="submitAnswer(q)"
                    [disabled]="!q.userAnswer.trim()"
                    class="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                }
                <button
                  (click)="q.showAnswer = !q.showAnswer"
                  class="btn-secondary text-sm"
                >
                  {{ q.showAnswer ? 'Hide' : 'Show' }} Model Answer
                </button>
              </div>

              <!-- Model Answer -->
              @if (q.showAnswer) {
                <div class="mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <h4 class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-2">💡 Model Answer</h4>
                  <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ q.modelAnswer }}</p>
                </div>
              }
            </div>
          }
        </div>

        <!-- Completion -->
        @if (allAnswered()) {
          <div class="card mt-8 text-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <div class="text-4xl mb-3">🎉</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Session Complete!</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              You've answered all {{ sessionQuestions().length }} questions. Review the model answers to improve.
            </p>
            <div class="flex justify-center gap-3">
              <button (click)="startInterview()" class="btn-primary">
                New Session
              </button>
              <a routerLink="/dashboard" class="btn-secondary">
                Back to Dashboard
              </a>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class InterviewComponent {
  profileService = inject(ProfileService);
  gapService = inject(GapAnalysisService);

  Math = Math;

  started = signal(false);
  sessionQuestions = signal<QuestionState[]>([]);

  availableQuestions = computed(() => {
    const analysis = this.gapService.analysis();
    if (!analysis) return [];

    const gapSkillIds = [
      ...analysis.mustHave.map(g => g.skillId),
      ...analysis.recommended.map(g => g.skillId),
    ];

    return INTERVIEW_QUESTIONS.filter(q => gapSkillIds.includes(q.skillId));
  });

  answeredCount = computed(() => {
    return this.sessionQuestions().filter(q => q.submitted).length;
  });

  progressPercent = computed(() => {
    const total = this.sessionQuestions().length;
    return total > 0 ? (this.answeredCount() / total) * 100 : 0;
  });

  allAnswered = computed(() => {
    const questions = this.sessionQuestions();
    return questions.length > 0 && questions.every(q => q.submitted);
  });

  startInterview(): void {
    const available = this.availableQuestions();
    // Shuffle and pick up to 5
    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 5);

    this.sessionQuestions.set(
      shuffled.map(q => ({
        questionId: q.id,
        skillId: q.skillId,
        skillName: SKILLS.find(s => s.id === q.skillId)?.name || q.skillId,
        question: q.question,
        difficulty: q.difficulty,
        modelAnswer: q.modelAnswer,
        userAnswer: '',
        showAnswer: false,
        submitted: false,
      }))
    );

    this.started.set(true);
  }

  submitAnswer(q: QuestionState): void {
    this.sessionQuestions.update(questions =>
      questions.map(question =>
        question.questionId === q.questionId
          ? { ...question, submitted: true }
          : question
      )
    );
  }

  resetInterview(): void {
    this.started.set(false);
    this.sessionQuestions.set([]);
  }
}

