import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/session/auth.service';
import { NotificationStore } from '../../core/stores/notification.store';
import { ToastHostComponent } from '../ui/toast-host.component';
import { fullName } from '../../core/domain/user.model';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHostComponent],
  template: `
    <div class="shell">
      <aside class="sidenav">
        <div class="brand">
          <img src="logo.png" alt="eBPCO" />
          <span>eBPCO Portal</span>
        </div>
        <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Home</a>
        <a class="nav-link" routerLink="/businesses" routerLinkActive="active">Businesses</a>
        <a class="nav-link" routerLink="/permits" routerLinkActive="active">Permit Services</a>
        <a class="nav-link" routerLink="/applications" routerLinkActive="active">My Applications</a>
        <a class="nav-link" routerLink="/documents" routerLinkActive="active">My Documents</a>
        <a class="nav-link" routerLink="/payments" routerLinkActive="active">Payments</a>
        <a class="nav-link" routerLink="/notifications" routerLinkActive="active">
          Notifications
          @if (notifications.unreadCount() > 0) {
            <span class="badge badge-red" style="margin-left:auto">{{ notifications.unreadCount() }}</span>
          }
        </a>
        <a class="nav-link" routerLink="/profile" routerLinkActive="active">Profile</a>
        <a class="nav-link" routerLink="/help" routerLinkActive="active">Help &amp; Support</a>
        <hr class="divider" />
        <button class="nav-link" style="width:100%; text-align:left; border:none; background:none; cursor:pointer;" (click)="logout()">Log Out</button>
      </aside>
      <div class="main">
        <div class="topbar">
          <span class="muted small">{{ userName() }}</span>
        </div>
        <router-outlet />
      </div>
    </div>
    <app-toast-host />
  `,
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly notifications = inject(NotificationStore);

  userName(): string {
    const u = this.auth.currentUser();
    return u ? fullName(u) : '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
