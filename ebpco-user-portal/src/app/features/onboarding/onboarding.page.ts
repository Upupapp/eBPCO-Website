import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '../../core/session/onboarding.service';

interface OnboardingSlide {
  title: string;
  body: string;
}

@Component({
  selector: 'app-onboarding',
  template: `
    <div style="min-height:100vh; display:flex; flex-direction:column; padding:24px;">
      <div style="display:flex; justify-content:flex-end;">
        <button
          class="btn btn-ghost btn-sm"
          [style.visibility]="isLast() ? 'hidden' : 'visible'"
          (click)="finish()"
        >
          Skip
        </button>
      </div>

      <div style="flex:1; display:flex; align-items:center; overflow:hidden;">
        <div class="onboarding-track" [style.transform]="'translateX(-' + index() * 100 + '%)'" style="width:100%;">
          @for (slide of slides; track slide.title; let i = $index) {
            <div class="onboarding-slide">
              <div
                [class.anim-flip-in]="i === index()"
                style="width:120px; height:120px; margin:0 auto 24px; border-radius:50%; background:var(--gold-100); display:flex; align-items:center; justify-content:center;"
              >
                <img src="logo.png" alt="" style="width:56px; height:56px; object-fit:contain;" />
              </div>
              <h2 [class.anim-fade-rise]="i === index()" style="animation-delay:0.15s;">{{ slide.title }}</h2>
              <p class="muted" [class.anim-fade-rise]="i === index()" style="animation-delay:0.25s;">{{ slide.body }}</p>
            </div>
          }
        </div>
      </div>

      <div class="onboarding-dots">
        @for (slide of slides; track slide.title; let i = $index) {
          <span class="onboarding-dot" [class.active]="i === index()"></span>
        }
      </div>

      <button class="btn btn-primary btn-block" (click)="isLast() ? finish() : next()">
        {{ isLast() ? 'Get Started' : 'Next' }}
      </button>
    </div>
  `,
})
export class OnboardingPage {
  private readonly router = inject(Router);
  private readonly onboarding = inject(OnboardingService);

  readonly slides: OnboardingSlide[] = [
    {
      title: 'Apply for permits from your phone',
      body: 'Submit new, renewal, and amendment permit applications through a simple mobile process.',
    },
    {
      title: 'Submit and manage requirements',
      body: 'Review required documents and prepare your permit application in one place.',
    },
    {
      title: 'Track your application',
      body: 'Monitor evaluations, payments, approval, and permit release status.',
    },
  ];

  readonly index = signal(0);
  readonly isLast = computed(() => this.index() === this.slides.length - 1);

  next(): void {
    this.index.update((i) => Math.min(i + 1, this.slides.length - 1));
  }

  finish(): void {
    this.onboarding.markCompleted();
    this.router.navigate(['/landing']);
  }
}
