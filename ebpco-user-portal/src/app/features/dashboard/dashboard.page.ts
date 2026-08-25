import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApplicationStore } from '../../core/stores/application.store';
import { BusinessStore } from '../../core/stores/business.store';
import { NotificationStore } from '../../core/stores/notification.store';
import { AuthService } from '../../core/session/auth.service';
import { StatusPillComponent } from '../../shared/ui/status-pill.component';
import { applicantStatusOf } from '../../core/domain/status.model';
import { fullName } from '../../core/domain/user.model';
import { formatDate } from '../../core/utils/ids';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, StatusPillComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Welcome back, {{ firstName() }}</h1>
          <div class="subtitle">Here's what's happening with your applications.</div>
        </div>
        <div style="display:flex; gap:10px;">
          <a routerLink="/permits" class="btn btn-primary">Apply for Permit</a>
          <a routerLink="/businesses/register" class="btn btn-secondary">Register Business</a>
        </div>
      </div>

      <div class="grid grid-fixed-4" style="margin-bottom:20px;">
        <div class="card">
          <div class="muted small">My Businesses</div>
          <div style="font-size:28px; font-weight:700;">{{ businesses.myBusinesses().length }}</div>
        </div>
        <div class="card">
          <div class="muted small">Total Applications</div>
          <div style="font-size:28px; font-weight:700;">{{ applications.myApplications().length }}</div>
        </div>
        <div class="card">
          <div class="muted small">Awaiting Action</div>
          <div style="font-size:28px; font-weight:700; color:var(--warning-text)">{{ awaitingAction() }}</div>
        </div>
        <div class="card">
          <div class="muted small">Ready for Release</div>
          <div style="font-size:28px; font-weight:700; color:var(--success-text)">{{ readyForRelease() }}</div>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: 2fr 1fr; align-items:start;">
        <div class="card">
          <div class="card-title">Active Applications</div>
          @if (applications.myApplications().length === 0) {
            <div class="empty-state">No applications yet. <a routerLink="/permits">Start your first application.</a></div>
          } @else {
            @for (app of applications.myApplications(); track app.id) {
              <a [routerLink]="['/applications', app.id]" style="display:block; text-decoration:none; color:inherit;">
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border-light);">
                  <div>
                    <div style="font-weight:600; color:var(--gray-900);">{{ app.permitType }}</div>
                    <div class="muted small">{{ app.applicationNumber }} · {{ app.businessName }}</div>
                  </div>
                  <app-status-pill [label]="statusLabel(app.lifecycleStatus)" />
                </div>
              </a>
            }
          }
        </div>

        <div class="card">
          <div class="card-title">Recent Notifications</div>
          @for (n of notifications.all().slice(0, 4); track n.id) {
            <div style="padding:10px 0; border-bottom:1px solid var(--border-light);">
              <div style="font-weight:600; font-size:13.5px;" [class.muted]="n.isRead">{{ n.title }}</div>
              <div class="small muted">{{ n.message }}</div>
              <div class="small muted">{{ formatDate(n.createdAt) }}</div>
            </div>
          }
          <a routerLink="/notifications" class="small">View all notifications</a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardPage {
  protected readonly applications = inject(ApplicationStore);
  protected readonly businesses = inject(BusinessStore);
  protected readonly notifications = inject(NotificationStore);
  private readonly auth = inject(AuthService);

  protected readonly formatDate = formatDate;

  firstName(): string {
    const u = this.auth.currentUser();
    return u ? fullName(u).split(' ')[0] : '';
  }

  statusLabel(status: Parameters<typeof applicantStatusOf>[0]): string {
    return applicantStatusOf(status);
  }

  awaitingAction(): number {
    return this.applications
      .myApplications()
      .filter((a) => ['Draft', 'Revision Required', 'Assessed'].includes(a.lifecycleStatus)).length;
  }

  readyForRelease(): number {
    return this.applications.myApplications().filter((a) => a.lifecycleStatus === 'Ready for Release').length;
  }
}
