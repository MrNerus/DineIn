import { computed, inject, Injectable, signal } from '@angular/core';
import { DataService } from './data';
import { Branch, Company, CompanyInfo } from '../interfaces/DTO';

const STORAGE_KEY = 'savana_selected_branch';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private dataService = inject(DataService);

  public readonly branches = signal<Branch[]>([]);
  public readonly activeBranches = computed(() => this.branches().filter(b => b.isActive !== false));
  public readonly companyInfo = signal<CompanyInfo | null>(null);
  public readonly selectedBranch = signal<Branch | null>(null);
  public readonly isBranchPickerOpen = signal<boolean>(false);
  public readonly isNoticeOpen = signal<boolean>(false);
  public readonly isLoaded = signal<boolean>(false);

  public readonly hasSelectedBranch = computed(() => !!this.selectedBranch());
  public readonly selectedBranchName = computed(() => this.selectedBranch()?.name || 'Selecionar Loja');
  public readonly selectedBranchIdentifier = computed(() => this.selectedBranch()?.identifier || '');
  public readonly selectedBranchAddress = computed(() => this.selectedBranch()?.address || '');
  public readonly selectedBranchPhone = computed(() => this.selectedBranch()?.phone || '');
  public readonly selectedBranchOpeningHours = computed(() => this.selectedBranch()?.openingTime || []);
  public readonly selectedBranchRedirects = computed(() => this.selectedBranch()?.redirects);

  public readonly socials = computed(() => this.companyInfo()?.socials || { facebook: null, instagram: null });
  public readonly apps = computed(() => this.companyInfo()?.apps || { appleAppStore: null, googlePlayStore: null });
  public readonly notice = computed(() => this.companyInfo()?.notice || []);
  public readonly hasNotice = computed(() => (this.notice()?.length ?? 0) > 0);

  constructor() {
    this.loadCompany();
  }

  public loadCompany(): void {
    this.dataService.getCompany().subscribe({
      next: (company: Company) => {
        const activeBranches = (company?.branchInfo || []).filter(b => b.isActive !== false);
        this.branches.set(activeBranches);
        this.companyInfo.set(company?.companyInfo || null);
        this.isLoaded.set(true);
        this.restoreBranchSelection(activeBranches);

        if (company?.companyInfo?.notice && company.companyInfo.notice.length > 0) {
          this.isNoticeOpen.set(true);
        }
      },
      error: (err: unknown) => {
        console.error('Failed to load company data:', err);
        this.isLoaded.set(true);
      }
    });
  }

  public closeNotice(): void {
    this.isNoticeOpen.set(false);
  }

  private restoreBranchSelection(branchList: Branch[]): void {
    try {
      const savedIdentifier = sessionStorage.getItem(STORAGE_KEY);
      if (savedIdentifier) {
        const found = branchList.find(b => b.identifier.toLowerCase() === savedIdentifier.toLowerCase());
        if (found) {
          this.selectedBranch.set(found);
          this.isBranchPickerOpen.set(false);
          return;
        }
      }
    } catch {
      // Ignore sessionStorage security / privacy mode exceptions
    }

    // No valid saved branch -> trigger onboarding branch selector
    sessionStorage.setItem(STORAGE_KEY, '');
    // this.isBranchPickerOpen.set(true);
  }

  public selectBranch(branchOrIdentifier: Branch | string): void {
    const identifier = typeof branchOrIdentifier === 'string' 
      ? branchOrIdentifier 
      : branchOrIdentifier.identifier;

    const found = this.branches().find(b => b.identifier.toLowerCase() === identifier.toLowerCase());
    if (found) {
      this.selectedBranch.set(found);
      try {
        sessionStorage.setItem(STORAGE_KEY, found.identifier);
      } catch {
        // Ignore sessionStorage exceptions
      }
      this.isBranchPickerOpen.set(false);
    }
  }

  public openBranchPicker(): void {
    this.isBranchPickerOpen.set(true);
  }

  public closeBranchPicker(): void {
    this.isBranchPickerOpen.set(false);
  }
}

