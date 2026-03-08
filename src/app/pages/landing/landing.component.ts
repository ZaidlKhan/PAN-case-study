import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex flex-col">
      <!-- Hero -->
      <section class="flex-1 flex items-center justify-center px-4 py-20">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            From where you are<br />
            <span class="text-indigo-600 dark:text-indigo-400">to where you want to be</span>
          </h1>
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Paste your resume, pick your dream role, and get a personalized gap analysis
            with actionable steps — powered by real career data.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/profile" class="btn-primary text-lg px-8 py-3">
              Get Started →
            </a>
            <a routerLink="/paths" class="btn-secondary text-lg px-8 py-3">
              Explore Career Paths
            </a>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-20 px-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How it works
          </h2>
          <div class="grid md:grid-cols-3 gap-8">
            @for (feature of features; track feature.title) {
              <div class="card text-center hover:shadow-md transition-shadow">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {{ feature.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  {{ feature.description }}
                </p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Personas -->
      <section class="py-20 px-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Built for
          </h2>
          <div class="grid md:grid-cols-3 gap-6">
            @for (persona of personas; track persona.title) {
              <div class="card hover:shadow-md transition-shadow border-l-4" [style.border-left-color]="persona.color">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {{ persona.title }}
                </h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm italic mb-3">
                  "{{ persona.pain }}"
                </p>
                <p class="text-gray-600 dark:text-gray-300 text-sm">
                  {{ persona.solution }}
                </p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="bg-indigo-600 dark:bg-indigo-900 py-16 px-4 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">
          Ready to bridge the gap?
        </h2>
        <p class="text-indigo-100 mb-8 max-w-xl mx-auto">
          It takes 2 minutes to get your personalized career analysis. No sign-up required.
        </p>
        <a routerLink="/profile" class="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors">
          Start Now — It's Free →
        </a>
      </section>
    </div>
  `,
})
export class LandingComponent {
  features = [
    {
      title: '1. Build Your Profile',
      description: 'Paste your resume or manually add your skills and employment history.',
    },
    {
      title: '2. See Your Gaps',
      description: 'Pick a dream role and see exactly which skills you\'re missing, ranked by market demand.',
    },
    {
      title: '3. Explore Career Paths',
      description: 'See how real professionals reached your target role — their education, companies, and journey.',
    },
  ];

  personas = [
    {
      title: 'Recent Graduates',
      pain: 'Job posts ask for things I\'ve never heard of',
      solution: 'Get prioritized skill gaps with free course recommendations.',
      color: '#6366f1',
    },
    {
      title: 'Career Switchers',
      pain: 'What from my background transfers to tech?',
      solution: 'See which of your existing skills already apply — and the shortest path to bridge the rest.',
      color: '#10b981',
    },
    {
      title: 'Self-Taught Developers',
      pain: 'I\'ve built projects but don\'t know what I\'m missing',
      solution: 'Match your skills against real job requirements and discover blind spots.',
      color: '#f59e0b',
    },
  ];
}
