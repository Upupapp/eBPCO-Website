import { Component, computed, inject, input } from '@angular/core';
import { ApplicationStore } from '../../core/domain/application-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';

type PermitPublicStatus = 'Valid' | 'Expired' | 'Suspended' | 'Revoked';

/**
 * Public, no-login verification page — the destination the QR code on
 * every generated permit points to. The token is simply the real,
 * backend-generated permit number itself (already unique and meant to be
 * publicly quotable, since it's printed on the physical document) — no
 * separate hashing/token scheme for this frontend-only prototype.
 */
@Component({
  selector: 'app-verify-permit',
  templateUrl: './verify-permit.html',
  styleUrl: './verify-permit.scss',
})
export class VerifyPermit {
  private readonly store = inject(ApplicationStore);

  readonly permitNumber = input<string>('');

  protected readonly permit = computed(() => {
    const number = this.permitNumber();
    return number ? this.store.getPermitByNumber(number) : undefined;
  });

  protected readonly row = computed(() => {
    const permit = this.permit();
    return permit ? this.store.getById(permit.applicationId) : undefined;
  });

  protected readonly business = computed(() => {
    const row = this.row();
    return row ? this.store.getBusiness(row.businessId) : undefined;
  });

  protected readonly businessLabel = computed(() => {
    const row = this.row();
    if (!row) return null;
    return this.business()?.name || row.businessName || null;
  });

  protected readonly documentTitle = computed(() => {
    const row = this.row();
    return row ? requirementsFor(row.permitType).finalDocument : null;
  });

  protected readonly status = computed<PermitPublicStatus>(() => {
    const permit = this.permit();
    if (!permit) return 'Valid';
    if (permit.revocationStatus === 'Revoked') return 'Revoked';
    if (permit.revocationStatus === 'Suspended') return 'Suspended';
    if (permit.expiryDateValue && permit.expiryDateValue.getTime() < Date.now()) return 'Expired';
    return 'Valid';
  });
}
