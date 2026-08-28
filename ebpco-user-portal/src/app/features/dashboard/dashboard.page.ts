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
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
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
