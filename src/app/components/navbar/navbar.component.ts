import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a routerLink="/" class="text-xl font-bold text-indigo-400 hover:opacity-80 transition-opacity">
            Skill-Bridge
          </a>

          <div class="hidden md:flex items-center gap-1">
            @for (link of navLinks; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-indigo-950 text-indigo-400"
                [routerLinkActiveOptions]="{ exact: link.exact }"
                class="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                {{ link.label }}
              </a>
            }
          </div>
        </div>

        <div class="md:hidden flex gap-1 pb-3 overflow-x-auto">
          @for (link of navLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="bg-indigo-950 text-indigo-400"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              class="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              {{ link.label }}
            </a>
          }
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  navLinks = [
    { path: '/profile', label: 'Profile', exact: false },
    { path: '/dashboard', label: 'Dashboard', exact: false },
    { path: '/paths', label: 'Career Paths', exact: false },
    { path: '/resume-scorer', label: 'Resume Scorer', exact: false },
  ];
}
