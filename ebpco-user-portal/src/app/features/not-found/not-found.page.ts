import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/session/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;">
      <div class="empty-state">
        <h1>Page not found</h1>
        <p class="muted">The page you're looking for doesn't exist.</p>
        <a [routerLink]="auth.isAuthenticated() ? '/dashboard' : '/landing'" class="btn btn-primary" style="margin-top:12px;">
          Back to Home
        </a>
      </div>
    </div>
  `,
})
export class NotFoundPage {
  protected readonly auth = inject(AuthService);
}
