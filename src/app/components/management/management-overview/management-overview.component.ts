import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ManagementService } from '../../../services/management.service';

@Component({
  selector: 'app-management-overview',
  imports: [RouterLink],
  templateUrl: './management-overview.html',
  styleUrl: './management-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementOverviewComponent {
  public managementService = inject(ManagementService);

  public readonly isJsonExpanded = signal<boolean>(false);
  public readonly isCopied = signal<boolean>(false);

  public readonly totalBranches = computed(() => this.managementService.branches().length);
  public readonly totalDeliveryPartners = computed(() => this.managementService.companyInfo()?.deliveryPartners?.length ?? 0);
  public readonly totalNoticeAds = computed(() => this.managementService.companyInfo()?.notice?.length ?? 0);
  
  public readonly totalSocials = computed(() => {
    const socials = this.managementService.companyInfo()?.socials;
    if (!socials) return 0;
    return (socials.facebook ? 1 : 0) + (socials.instagram ? 1 : 0);
  });

  public toggleJsonView(): void {
    this.isJsonExpanded.update(v => !v);
  }

  public copyJson(): void {
    const jsonStr = this.managementService.getFormattedJson();
    navigator.clipboard.writeText(jsonStr).then(() => {
      this.isCopied.set(true);
      this.managementService.showNotification('JSON copiado para a área de transferência!', 'success');
      setTimeout(() => this.isCopied.set(false), 2500);
    });
  }

  public onRefreshData(): void {
    this.managementService.loadData().subscribe();
  }
}

