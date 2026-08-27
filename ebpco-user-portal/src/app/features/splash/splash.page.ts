import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/session/auth.service';
import { OnboardingService } from '../../core/session/onboarding.service';

const SPLASH_DURATION_MS = 900;

@Component({
  selector: 'app-splash',
  template: `
    <div style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; background:var(--primary-500);">
      <div style="width:76px; height:76px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-md);">
        <img src="logo.png" alt="eBPCO" style="width:46px; height:46px; object-fit:contain;" />
      </div>
      <div style="text-align:center;">
        <h1 style="color:#fff; margin-bottom:4px;">eBPCO</h1>
        <p style="color:rgba(255,255,255,.75); margin:0;">Permits and clearances, simplified.</p>
      </div>
      <div class="splash-spinner"></div>
    </div>
  `,
})
export class SplashPage implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly onboarding = inject(OnboardingService);

  ngOnInit(): void {
    setTimeout(() => this.proceed(), SPLASH_DURATION_MS);
  }

  private proceed(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else if (!this.onboarding.isCompleted()) {
      this.router.navigate(['/onboarding']);
    } else {
      this.router.navigate(['/landing']);
    }
  }
}
