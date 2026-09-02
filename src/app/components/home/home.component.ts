import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchService } from '../../services/branch.service';
import { Branch } from '../../interfaces/DTO';

export type ModalType = 
  | 'branch-picker'
  | 'reservation'
  | 'order'
  | 'menu'
  | 'location'
  | 'contact'
  | 'get-app'
  | 'reviews'
  | 'privacy';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  public branchService = inject(BranchService);

  public activeModal = signal<ModalType | null>(null);
  public currentNoticeIndex = signal<number>(0);
  private onBranchPickerClose: string = '';

  @HostListener('document:keydown', ['$event'])
  public onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.branchService.isNoticeOpen()) {
        this.closeNotice();
      } else if (this.activeModal()) {
        this.closeModal();
      }
    } else if (this.branchService.isNoticeOpen()) {
      if (event.key === 'ArrowRight') {
        this.nextNotice();
      } else if (event.key === 'ArrowLeft') {
        this.prevNotice();
      }
    }
  }

  public nextNotice(): void {
    const total = this.branchService.notice().length;
    if (total > 0) {
      this.currentNoticeIndex.update(i => (i + 1) % total);
    }
  }

  public prevNotice(): void {
    const total = this.branchService.notice().length;
    if (total > 0) {
      this.currentNoticeIndex.update(i => (i - 1 + total) % total);
    }
  }

  public setNoticeIndex(index: number): void {
    this.currentNoticeIndex.set(index);
  }

  public closeNotice(): void {
    this.branchService.closeNotice();
  }

  public openModal(type: ModalType): void {
    const requireBranchSelected = ['reservation', 'order', 'menu', 'location', 'contact', 'reviews'];
    if (requireBranchSelected.includes(type) && !this.branchService.hasSelectedBranch()) {
      this.openBranchPicker(type);
      return;
    } 

    this.activeModal.set(type);
  }

  public closeModal(): void {
    this.activeModal.set(null);
  }

  public openBranchPicker(onBranchPickerClose: string = ''): void {
    this.onBranchPickerClose = onBranchPickerClose;
    this.branchService.openBranchPicker();
  }

  public closeBranchPicker(): void {
    this.branchService.closeBranchPicker();

    const actionOnClose: Record<string, () => void> = {
      "reservation": () => this.redirectToReservation(),
      "delivery": () => this.redirectToDelivery(),
      "menu": () => this.openModal('menu'),
      "location": () => this.openModal('location'),
      "contact": () => this.openModal('contact'),
      "reviews": () => this.openModal('reviews'),
    }

    if ( this.branchService.hasSelectedBranch() &&
      this.onBranchPickerClose && 
      Object.keys(actionOnClose).includes(this.onBranchPickerClose)
    ) {
      actionOnClose[this.onBranchPickerClose]();
    }

    this.onBranchPickerClose = "";
  }

  public selectBranch(branch: Branch): void {
    this.branchService.selectBranch(branch);
    this.closeBranchPicker();
  }

  public redirectToAppStore(): void {
    const appUrl = this.branchService.companyInfo()?.apps?.appleAppStore;
    if (appUrl) {
      window.open(appUrl, '_blank');
    }
  }

  public redirectToPlayStore(): void {
    const appUrl = this.branchService.companyInfo()?.apps?.googlePlayStore;
    if (appUrl) {
      window.open(appUrl, '_blank');
    }
  }

  public redirectToReservation(): void {
    if (!this.branchService.hasSelectedBranch()) {
      this.openBranchPicker('reservation');
      return;
    }

    const reservationUrl = this.branchService.selectedBranchRedirects()?.reservation;
    if (reservationUrl) {
      window.open(reservationUrl, '_blank');
    }
  }

  public redirectToDelivery(): void {
    if (!this.branchService.hasSelectedBranch()) {
      this.openBranchPicker('delivery');
      return;
    }

    const deliveryUrl = this.branchService.selectedBranchRedirects()?.delivery;
    if (deliveryUrl) {
      window.open(deliveryUrl, '_blank');
    }
  }
}
