import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh; display:flex; flex-direction:column;">
      <header style="display:flex; align-items:center; justify-content:space-between; padding:18px 32px; background:#fff; border-bottom:1px solid var(--border-light);">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="logo.png" alt="eBPCO" style="width:34px; height:34px; object-fit:contain;" />
          <strong style="font-size:16px;">eBPCO User Portal</strong>
        </div>
        <div style="display:flex; gap:10px;">
          <a routerLink="/login" class="btn btn-secondary">Log In</a>
          <a routerLink="/register" class="btn btn-primary">Register</a>
        </div>
      </header>
      <div class="accent-bar"></div>

      <section style="flex:1; display:flex; align-items:center; justify-content:center; padding:48px 24px;">
        <div style="max-width:760px; text-align:center;">
          <h1 style="font-size:36px; margin-bottom:12px;">Apply for permits from anywhere</h1>
          <p class="muted" style="font-size:16px; margin-bottom:28px;">
            Register your business, submit permit applications, upload requirements, pay assessed fees,
            and track every application — all in one place, in parity with the eBPCO mobile app.
          </p>
          <div style="display:flex; gap:12px; justify-content:center; margin-bottom:40px;">
            <a routerLink="/register" class="btn btn-primary">Get Started</a>
            <a routerLink="/login" class="btn btn-secondary">I already have an account</a>
          </div>
          <div class="grid grid-fixed-3">
            <div class="card card-accent-primary">
              <h3>Submit &amp; Manage Requirements</h3>
              <p class="muted small">Upload documents once and reuse them across applications with your personal document library.</p>
            </div>
            <div class="card card-accent-gold">
              <h3>Track Your Application</h3>
              <p class="muted small">Follow every step from submission to release with a clear status timeline.</p>
            </div>
            <div class="card card-accent-success">
              <h3>Pay Securely</h3>
              <p class="muted small">View your Order of Payment and pay by bank transfer or onsite.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class LandingPage {}
