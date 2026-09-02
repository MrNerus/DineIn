import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { Branch, Company, CompanyInfo } from '../interfaces/DTO';
import { DataService } from './data';

const CMS_STORAGE_KEY = 'savana_cms_company_data';

@Injectable({
  providedIn: 'root'
})
export class ManagementService {
  private http = inject(HttpClient);
  private dataService = inject(DataService);

  public readonly company = signal<Company | null>(null);
  public readonly branches = computed<Branch[]>(() => this.company()?.branchInfo ?? []);
  public readonly companyInfo = computed<CompanyInfo | null>(() => this.company()?.companyInfo ?? null);

  public readonly isLoading = signal<boolean>(false);
  public readonly isSaving = signal<boolean>(false);
  public readonly notification = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  private notificationTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadData();
  }

  public loadData(): void {
    this.isLoading.set(true);

    // Check local storage draft first
    const localDraft = this.getStoredDraft();
    if (localDraft) {
      this.company.set(localDraft);
      this.isLoading.set(false);
      return;
    }

    // Attempt to load from API or static asset
    this.http.get<Company>('api/data.php').pipe(
      catchError(() => this.dataService.getCompany()),
      catchError((err) => {
        console.error('Failed to load company data for CMS:', err);
        return of<Company | null>(null);
      })
    ).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        if (data) {
          this.company.set(data);
          this.saveDraft(data);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  public updateCompanyInfo(updatedInfo: CompanyInfo): void {
    const current = this.company();
    if (!current) return;

    this.isSaving.set(true);
    const updatedCompany: Company = {
      ...current,
      companyInfo: { ...updatedInfo }
    };

    // Update signal & local draft
    this.company.set(updatedCompany);
    this.saveDraft(updatedCompany);

    // Call PHP endpoint (PoC)
    this.http.post('api/company.php', updatedInfo).pipe(
      catchError(() => of({ status: 'success', message: 'Guardado com sucesso (Local)' }))
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showNotification('Informações da empresa guardadas com sucesso!', 'success');
      },
      error: () => {
        this.isSaving.set(false);
        this.showNotification('Informações guardadas localmente.', 'info');
      }
    });
  }

  /**
   * Creates a new default placeholder branch with inactive status,
   * separated internal ID, and unique identifier.
   */
  public createDefaultBranch(): Branch {
    const current = this.company();
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const newId = `branch_${timestamp}_${randomSuffix}`;
    const newIdentifier = `loja-rascunho-${randomSuffix}`;

    const newBranch: Branch = {
      id: newId,
      identifier: newIdentifier,
      name: 'Nova Loja (Rascunho)',
      address: 'Endereço da nova filial',
      phone: '+351000000000',
      lat: 38.7552,
      long: -9.2202,
      isActive: false, // Inactive by default
      openingTime: [
        {
          dayPt: 'Segunda a domingo',
          dayEn: 'Monday to Sunday',
          timePt: 'das 11h às 15h30, das 18h às 23h',
          timeEn: '11 AM to 3:30 PM, 6 PM to 11 PM'
        }
      ],
      deliveryTime: [],
      pickupTime: [],
      redirects: {
        reservation: '',
        delivery: '',
        pickup: '',
        googleReview: null,
        location: '',
        pdf: {
          dinein1: 'assets/pdfs/Menu.pdf',
          dinein2: ''
        }
      },
      reviews: []
    };

    const branches = [...(current?.branchInfo || []), newBranch];
    const updatedCompany: Company = current 
      ? { ...current, branchInfo: branches }
      : {
          companyInfo: {
            name: 'Savana Sushi',
            logo: 'assets/imgs/logo.png',
            favicon: 'assets/imgs/logo.png',
            apps: { googlePlayStore: null, appleAppStore: null },
            socials: { facebook: null, instagram: null },
            deliveryPartners: []
          },
          branchInfo: branches
        };

    this.company.set(updatedCompany);
    this.saveDraft(updatedCompany);

    // Call PHP endpoint
    this.http.post('api/branches.php?action=create_default', newBranch).pipe(
      catchError(() => of({ status: 'success', message: 'Criado com sucesso (Local)' }))
    ).subscribe({
      next: () => {
        this.showNotification('Novo rascunho de restaurante criado! Pode configurar cada secção agora.', 'success');
      },
      error: () => {
        this.showNotification('Rascunho de restaurante criado localmente.', 'info');
      }
    });

    return newBranch;
  }

  /**
   * Saves a specific section of a branch individually.
   */
  public saveBranchSection(
    idOrIdentifier: string,
    section: 'info' | 'schedule' | 'redirects' | 'reviews',
    sectionData: any
  ): boolean {
    const current = this.company();
    if (!current) return false;

    const branches = [...(current.branchInfo || [])];
    const index = branches.findIndex(
      b => (b.id && String(b.id).toLowerCase() === idOrIdentifier.toLowerCase()) ||
           (b.identifier && b.identifier.toLowerCase() === idOrIdentifier.toLowerCase())
    );

    if (index === -1) {
      this.showNotification('Restaurante não encontrado para atualização.', 'error');
      return false;
    }

    const existingBranch = branches[index];
    let updatedBranch: Branch;

    if (section === 'info') {
      const newIdentifier = sectionData.identifier.trim();
      // Check for identifier uniqueness if changed
      const duplicateExists = branches.some((b, i) => 
        i !== index && b.identifier.toLowerCase() === newIdentifier.toLowerCase()
      );
      if (duplicateExists) {
        this.showNotification(`O identificador "${newIdentifier}" já está a ser utilizado por outro restaurante.`, 'error');
        return false;
      }

      updatedBranch = {
        ...existingBranch,
        identifier: newIdentifier,
        name: sectionData.name.trim(),
        address: sectionData.address.trim(),
        phone: sectionData.phone.trim(),
        lat: Number(sectionData.lat),
        long: Number(sectionData.long),
        isActive: sectionData.isActive ?? existingBranch.isActive ?? false
      };
    } else if (section === 'schedule') {
      updatedBranch = {
        ...existingBranch,
        openingTime: sectionData,
        deliveryTime: sectionData,
        pickupTime: sectionData
      };
    } else if (section === 'redirects') {
      updatedBranch = {
        ...existingBranch,
        redirects: {
          reservation: sectionData.reservation || null,
          delivery: sectionData.delivery || null,
          pickup: sectionData.pickup || null,
          googleReview: existingBranch.redirects?.googleReview || null,
          location: sectionData.location || null,
          pdf: {
            dinein1: sectionData.pdf?.dinein1 || null,
            dinein2: sectionData.pdf?.dinein2 || null
          }
        }
      };
    } else if (section === 'reviews') {
      updatedBranch = {
        ...existingBranch,
        reviews: sectionData
      };
    } else {
      updatedBranch = existingBranch;
    }

    branches[index] = updatedBranch;

    const updatedCompany: Company = {
      ...current,
      branchInfo: branches
    };

    this.isSaving.set(true);
    this.company.set(updatedCompany);
    this.saveDraft(updatedCompany);

    const sectionMessages: Record<string, string> = {
      info: 'Informações gerais guardadas com sucesso!',
      schedule: 'Horários de funcionamento guardados com sucesso!',
      redirects: 'URLs de redirecionamento e PDFs guardados!',
      reviews: 'Canais de avaliação guardados com sucesso!'
    };

    const targetKey = updatedBranch.id || updatedBranch.identifier;
    this.http.put(`api/branches.php?id=${encodeURIComponent(targetKey)}&section=${section}`, updatedBranch).pipe(
      catchError(() => of({ status: 'success', message: 'Guardado com sucesso (Local)' }))
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showNotification(sectionMessages[section] || 'Secção guardada com sucesso!', 'success');
      },
      error: () => {
        this.isSaving.set(false);
        this.showNotification('Secção guardada localmente.', 'info');
      }
    });

    return true;
  }

  /**
   * Toggles the active status of a branch.
   */
  public toggleBranchStatus(idOrIdentifier: string): boolean {
    const current = this.company();
    if (!current) return false;

    const branches = [...(current.branchInfo || [])];
    const index = branches.findIndex(
      b => (b.id && String(b.id).toLowerCase() === idOrIdentifier.toLowerCase()) ||
           (b.identifier && b.identifier.toLowerCase() === idOrIdentifier.toLowerCase())
    );

    if (index === -1) return false;

    const currentStatus = branches[index].isActive ?? false;
    const newStatus = !currentStatus;

    branches[index] = {
      ...branches[index],
      isActive: newStatus
    };

    const updatedCompany: Company = {
      ...current,
      branchInfo: branches
    };

    this.company.set(updatedCompany);
    this.saveDraft(updatedCompany);

    const targetKey = branches[index].id || branches[index].identifier;
    this.http.put(`api/branches.php?id=${encodeURIComponent(targetKey)}&section=status`, { isActive: newStatus }).pipe(
      catchError(() => of({ status: 'success' }))
    ).subscribe({
      next: () => {
        const msg = newStatus 
          ? `Restaurante "${branches[index].name}" ativado com sucesso!` 
          : `Restaurante "${branches[index].name}" marcado como inativo.`;
        this.showNotification(msg, 'success');
      }
    });

    return true;
  }

  public saveBranch(branchData: Branch, isNew: boolean, originalIdentifier?: string): boolean {
    const current = this.company();
    if (!current) return false;

    const branches = [...(current.branchInfo || [])];
    const targetIdentifier = originalIdentifier || branchData.identifier;

    // Check for duplicate slug on create
    if (isNew) {
      const exists = branches.some(
        b => b.identifier.toLowerCase() === branchData.identifier.trim().toLowerCase()
      );
      if (exists) {
        this.showNotification(`O identificador "${branchData.identifier}" já existe. Escolha outro.`, 'error');
        return false;
      }
      if (!branchData.id) {
        branchData.id = `branch_${Date.now()}`;
      }
      if (branchData.isActive === undefined) {
        branchData.isActive = false;
      }
      branches.push(branchData);
    } else {
      const index = branches.findIndex(
        b => (b.id && branchData.id && String(b.id).toLowerCase() === String(branchData.id).toLowerCase()) ||
             b.identifier.toLowerCase() === targetIdentifier.toLowerCase()
      );
      if (index === -1) {
        this.showNotification('Restaurante não encontrado para atualização.', 'error');
        return false;
      }
      branches[index] = branchData;
    }

    const updatedCompany: Company = {
      ...current,
      branchInfo: branches
    };

    this.isSaving.set(true);
    this.company.set(updatedCompany);
    this.saveDraft(updatedCompany);

    // Call PHP branch endpoint (PoC)
    const endpoint = isNew ? 'api/branches.php' : `api/branches.php?identifier=${encodeURIComponent(branchData.identifier)}`;
    const httpCall = isNew ? this.http.post(endpoint, branchData) : this.http.put(endpoint, branchData);

    httpCall.pipe(
      catchError(() => of({ status: 'success', message: 'Guardado com sucesso (Local)' }))
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        const msg = isNew ? `Restaurante "${branchData.name}" criado com sucesso!` : `Restaurante "${branchData.name}" atualizado!`;
        this.showNotification(msg, 'success');
      },
      error: () => {
        this.isSaving.set(false);
        this.showNotification('Restaurante guardado localmente.', 'info');
      }
    });

    return true;
  }

  public deleteBranch(idOrIdentifier: string): boolean {
    const current = this.company();
    if (!current) return false;

    const filtered = (current.branchInfo || []).filter(
      b => (b.id && String(b.id).toLowerCase() !== idOrIdentifier.toLowerCase()) &&
           b.identifier.toLowerCase() !== idOrIdentifier.toLowerCase()
    );

    const updatedCompany: Company = {
      ...current,
      branchInfo: filtered
    };

    this.isSaving.set(true);
    this.company.set(updatedCompany);
    this.saveDraft(updatedCompany);

    this.http.delete(`api/branches.php?identifier=${encodeURIComponent(idOrIdentifier)}`).pipe(
      catchError(() => of({ status: 'success', message: 'Removido com sucesso (Local)' }))
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showNotification(`Restaurante "${idOrIdentifier}" removido com sucesso.`, 'info');
      },
      error: () => {
        this.isSaving.set(false);
        this.showNotification(`Restaurante "${idOrIdentifier}" removido.`, 'info');
      }
    });

    return true;
  }

  public duplicateBranch(idOrIdentifier: string): void {
    const branch = this.getBranchByIdentifier(idOrIdentifier);
    if (!branch) return;

    const timestamp = Date.now();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `branch_${timestamp}_${randomSuffix}`;
    const newIdentifier = `${branch.identifier}-copia-${randomSuffix}`;

    const clonedBranch: Branch = {
      ...JSON.parse(JSON.stringify(branch)),
      id: newId,
      identifier: newIdentifier,
      name: `${branch.name} (Cópia)`,
      isActive: false // Inactive by default
    };

    this.saveBranch(clonedBranch, true);
  }

  public getBranchByIdentifier(idOrIdentifier: string): Branch | undefined {
    return this.branches().find(b => 
      (b.id && String(b.id).toLowerCase() === idOrIdentifier.toLowerCase()) ||
      b.identifier.toLowerCase() === idOrIdentifier.toLowerCase()
    );
  }

  public getFormattedJson(): string {
    const data = this.company();
    return data ? JSON.stringify(data, null, 2) : '{}';
  }

  public downloadJson(): void {
    const jsonStr = this.getFormattedJson();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'branches.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showNotification('Ficheiro branches.json transferido com sucesso!', 'success');
  }

  public resetToDefault(): void {
    try {
      sessionStorage.removeItem(CMS_STORAGE_KEY);
      localStorage.removeItem(CMS_STORAGE_KEY);
    } catch {
      // Ignore
    }
    this.dataService.getCompany().subscribe({
      next: (data) => {
        this.company.set(data);
        this.saveDraft(data);
        this.showNotification('Dados restaurados para a configuração original.', 'info');
      }
    });
  }

  public showNotification(message: string, type: 'success' | 'error' | 'info' = 'success', durationMs = 4000): void {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }
    this.notification.set({ message, type });
    this.notificationTimer = setTimeout(() => {
      this.notification.set(null);
    }, durationMs);
  }

  public clearNotification(): void {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }
    this.notification.set(null);
  }

  private getStoredDraft(): Company | null {
    try {
      const stored = localStorage.getItem(CMS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveDraft(data: Company): void {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}

