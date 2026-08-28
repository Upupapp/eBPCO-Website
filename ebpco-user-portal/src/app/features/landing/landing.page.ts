import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh; display:flex; flex-direction:column;">
      <header class="anim-fade-rise" style="display:flex; align-items:center; justify-content:space-between; padding:18px 32px; background:#fff; border-bottom:1px solid var(--border-light);">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="logo.png" alt="eBPCO" style="width:34px; height:34px; object-fit:contain;" />
          <strong style="font-size:16px;">eBPCO User Portal</strong>
        </div>
        <nav style="display:flex; align-items:center; gap:20px;">
          <a routerLink="/how-it-works" class="small" style="font-weight:600;">How It Works</a>
          <div style="display:flex; gap:10px;">
            <a routerLink="/login" class="btn btn-secondary">Log In</a>
            <a routerLink="/register" class="btn btn-primary">Register</a>
          </div>
        </nav>
      </header>
      <div class="accent-bar"></div>

      <section style="flex:1; display:flex; align-items:center; justify-content:center; padding:48px 24px;">
        <div style="max-width:760px; text-align:center;">
          <h1 class="anim-fade-rise" style="font-size:36px; margin-bottom:12px; animation-delay:0.1s;">Apply for permits from anywhere</h1>
          <p class="muted anim-fade-rise" style="font-size:16px; margin-bottom:28px; animation-delay:0.2s;">
            Register your business, submit permit applications, upload requirements, pay assessed fees,
            and track every application — all in one place, in parity with the eBPCO mobile app.
          </p>
          <div class="anim-fade-rise" style="display:flex; gap:12px; justify-content:center; margin-bottom:16px; animation-delay:0.3s;">
            <a routerLink="/register" class="btn btn-primary">Get Started</a>
            <a routerLink="/login" class="btn btn-secondary">I already have an account</a>
          </div>
          <div class="anim-fade-rise" style="margin-bottom:40px; animation-delay:0.35s;">
            <a routerLink="/how-it-works" class="small">See how the process works &rarr;</a>
          </div>
          <div class="grid grid-fixed-3">
            <div class="anim-fade-rise" style="animation-delay:0.4s; height:100%;">
              <div class="card card-fill card-accent-primary tilt-card" (mousemove)="onCardMove($event)" (mouseleave)="onCardLeave($event)">
                <h3>Submit &amp; Manage Requirements</h3>
                <p class="muted small">Upload documents once and reuse them across applications with your personal document library.</p>
              </div>
            </div>
            <div class="anim-fade-rise" style="animation-delay:0.48s; height:100%;">
              <div class="card card-fill card-accent-gold tilt-card" (mousemove)="onCardMove($event)" (mouseleave)="onCardLeave($event)">
                <h3>Track Your Application</h3>
                <p class="muted small">Follow every step from submission to release with a clear status timeline.</p>
              </div>
            </div>
            <div class="anim-fade-rise" style="animation-delay:0.56s; height:100%;">
              <div class="card card-fill card-accent-success tilt-card" (mousemove)="onCardMove($event)" (mouseleave)="onCardLeave($event)">
                <h3>Pay Securely</h3>
                <p class="muted small">View your Order of Payment and pay by bank transfer or onsite.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class LandingPage {
  // A real 3D tilt (perspective + rotateX/rotateY), not a decorative
  // gimmick — reads the pointer position relative to each card and maps
  // it to a small rotation via two CSS custom properties (--tilt-x/-y)
  // that .tilt-card's own transform already consumes (see styles.scss).
  // Skipped under prefers-reduced-motion by that same global rule.
  protected onCardMove(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--tilt-y', `${px * 10}deg`);
    card.style.setProperty('--tilt-x', `${py * -10}deg`);
  }

  protected onCardLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  }
}
