import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Branch, Company, CompanyInfo } from '../interfaces/DTO';
import { DataService } from './data';
import { ConfigService } from './config.service';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManagementService {
  private http = inject(HttpClient);
  private dataService = inject(DataService);
  private configService = inject(ConfigService);

  public readonly company = signal<Company | null>(null);
  public readonly branches = computed<Branch[]>(() => this.company()?.branchInfo ?? []);
  public readonly companyInfo = computed<CompanyInfo | null>(() => this.company()?.companyInfo ?? null);

  public readonly isLoading = signal<boolean>(false);
  public readonly isSaving = signal<boolean>(false);
  public readonly notification = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  private notificationTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadData().subscribe({
      next: data => console.log('loadData result:', data),
      error: err => console.error('loadData error:', err),
    });
  }

  /**
   * Loads full company and branch data directly from the backend API.
   */
  public loadData(): Observable<Company | null> {
    this.isLoading.set(true);
    console.log('Loading copmpany data:');

    return this.http.get<Company>(`${this.configService.backend_url}/api/data.php`).pipe(
      catchError((backendErr) => {
        console.warn('Error retriving company information', backendErr);
        return of(null);
      }),
      tap({
        next: (data) => {
          console.log('Company data loaded from backend:', data);
          this.isLoading.set(false);
          if (data) {
            this.company.set(data);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Failed to load company data for CMS from backend:', err);
          this.showNotification('Erro ao carregar dados do servidor.', 'error');
        }
      }),
      catchError((err) => {
        console.warn('Error processing company information', err);
        return of(null);
      })
    );
  }

  /**
   * Fetches an individual branch directly from the backend SQLite database.
   */
  public getBranchFromBackend(idOrIdentifier: string): Observable<Branch> {
    const encoded = encodeURIComponent(idOrIdentifier);
    return this.http.get<ApiResponse<Branch>>(`${this.configService.backend_url}/api/branches.php?id=${encoded}`).pipe(
      map(res => {
        if (res && res.data) {
          return res.data;
        }
        throw new Error('Branch data not found');
      }),
      catchError(err => {
        const inMemory = this.getBranchByIdentifier(idOrIdentifier);
        if (inMemory) {
          return of(inMemory);
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * Updates company info directly in the backend.
   */
  public updateCompanyInfo(updatedInfo: CompanyInfo): Observable<CompanyInfo> {
    this.isSaving.set(true);

    return this.http.post<ApiResponse<CompanyInfo>>(`${this.configService.backend_url}/api/company.php`, updatedInfo).pipe(
      map(res => (res && res.data ? res.data : updatedInfo)),
      tap({
        next: (savedInfo) => {
          const current = this.company();
          if (current) {
            this.company.set({
              ...current,
              companyInfo: { ...savedInfo }
            });
          }
          this.isSaving.set(false);
          this.showNotification('Informações da empresa guardadas com sucesso!', 'success');
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err?.error?.message || 'Falha ao guardar informações da empresa no servidor.';
          this.showNotification(errorMsg, 'error');
        }
      })
    );
  }

  /**
   * Creates a new default placeholder branch directly in the backend SQLite database.
   */
  public createDefaultBranch(): Observable<Branch> {
    this.isSaving.set(true);

    return this.http.post<ApiResponse<Branch>>(`${this.configService.backend_url}/api/branches.php?action=create_default`, {}).pipe(
      map(res => res.data),
      tap({
        next: (newBranch) => {
          const current = this.company();
          if (current) {
            this.company.set({
              ...current,
              branchInfo: [...current.branchInfo, newBranch]
            });
          }
          this.isSaving.set(false);
          this.showNotification('Novo restaurante criado na base de dados!', 'success');
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err?.error?.message || 'Falha ao criar novo restaurante no servidor.';
          this.showNotification(errorMsg, 'error');
        }
      })
    );
  }

  /**
   * Saves an individual section of a branch directly to the backend.
   */
  public saveBranchSection(
    idOrIdentifier: string,
    section: 'info' | 'schedule' | 'redirects' | 'reviews',
    sectionData: any
  ): Observable<Branch> {
    this.isSaving.set(true);
    const targetKey = encodeURIComponent(idOrIdentifier);

    return this.http.put<ApiResponse<Branch>>(
      `${this.configService.backend_url}/api/branches.php?id=${targetKey}&section=${section}`,
      sectionData
    ).pipe(
      map(res => res.data),
      tap({
        next: (updatedBranch) => {
          const current = this.company();
          if (current) {
            const branches = [...(current.branchInfo || [])];
            const index = branches.findIndex(
              b => (b.id && String(b.id).toLowerCase() === String(idOrIdentifier).toLowerCase()) ||
                   (b.identifier && b.identifier.toLowerCase() === String(idOrIdentifier).toLowerCase())
            );

            if (index !== -1) {
              branches[index] = updatedBranch;
            } else {
              branches.push(updatedBranch);
            }

            this.company.set({
              ...current,
              branchInfo: branches
            });
          }

          this.isSaving.set(false);

          const sectionMessages: Record<string, string> = {
            info: 'Informações gerais guardadas com sucesso na base de dados!',
            schedule: 'Horários de funcionamento guardados com sucesso!',
            redirects: 'URLs de redirecionamento e PDFs guardados!',
            reviews: 'Canais de avaliação guardados com sucesso!'
          };

          this.showNotification(sectionMessages[section] || 'Secção guardada com sucesso!', 'success');
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err?.error?.message || 'Falha ao guardar secção no servidor.';
          this.showNotification(errorMsg, 'error');
        }
      })
    );
  }

  /**
   * Toggles the active status of a branch directly on the backend.
   */
  public toggleBranchStatus(idOrIdentifier: string): Observable<boolean> {
    const current = this.company();
    const branch = this.getBranchByIdentifier(idOrIdentifier);
    if (!branch) {
      return of(false);
    }

    const newStatus = !(branch.isActive ?? false);
    const targetKey = encodeURIComponent(branch.id ? String(branch.id) : branch.identifier);

    this.isSaving.set(true);

    return this.http.put<ApiResponse<Branch>>(
      `${this.configService.backend_url}/api/branches.php?id=${targetKey}&section=status`,
      { isActive: newStatus }
    ).pipe(
      map(() => true),
      tap({
        next: () => {
          if (current) {
            const branches = current.branchInfo.map(b => {
              if ((b.id && String(b.id) === String(idOrIdentifier)) || b.identifier === idOrIdentifier) {
                return { ...b, isActive: newStatus };
              }
              return b;
            });
            this.company.set({ ...current, branchInfo: branches });
          }

          this.isSaving.set(false);
          const msg = newStatus 
            ? `Restaurante "${branch.name}" ativado com sucesso!` 
            : `Restaurante "${branch.name}" marcado como inativo.`;
          this.showNotification(msg, 'success');
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err?.error?.message || 'Falha ao atualizar estado no servidor.';
          this.showNotification(errorMsg, 'error');
        }
      })
    );
  }

  /**
   * Deletes a branch directly from the backend SQLite database.
   */
  public deleteBranch(idOrIdentifier: string): Observable<boolean> {
    this.isSaving.set(true);
    const targetKey = encodeURIComponent(idOrIdentifier);

    return this.http.delete<ApiResponse<any>>(`${this.configService.backend_url}/api/branches.php?id=${targetKey}`).pipe(
      map(() => true),
      tap({
        next: () => {
          const current = this.company();
          if (current) {
            const filtered = (current.branchInfo || []).filter(
              b => (b.id && String(b.id).toLowerCase() !== idOrIdentifier.toLowerCase()) &&
                   b.identifier.toLowerCase() !== idOrIdentifier.toLowerCase()
            );
            this.company.set({
              ...current,
              branchInfo: filtered
            });
          }

          this.isSaving.set(false);
          this.showNotification('Restaurante removido da base de dados com sucesso.', 'info');
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err?.error?.message || 'Falha ao remover restaurante do servidor.';
          this.showNotification(errorMsg, 'error');
        }
      })
    );
  }

  /**
   * Duplicates a branch directly via the backend API.
   */
  public duplicateBranch(idOrIdentifier: string): Observable<Branch | null> {
    const branch = this.getBranchByIdentifier(idOrIdentifier);
    if (!branch) {
      this.showNotification('Restaurante original não encontrado.', 'error');
      return of(null);
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newIdentifier = `${branch.identifier}-copia-${randomSuffix}`;

    const clonedPayload: Partial<Branch> = {
      ...JSON.parse(JSON.stringify(branch)),
      identifier: newIdentifier,
      name: `${branch.name} (Cópia)`,
      isActive: false
    };
    delete clonedPayload.id;

    this.isSaving.set(true);

    return this.http.post<ApiResponse<Branch>>(`${this.configService.backend_url}/api/branches.php`, clonedPayload).pipe(
      map(res => res.data),
      tap({
        next: (newBranch) => {
          const current = this.company();
          if (current) {
            this.company.set({
              ...current,
              branchInfo: [...current.branchInfo, newBranch]
            });
          }

          this.isSaving.set(false);
          this.showNotification(`Restaurante "${newBranch.name}" duplicado com sucesso!`, 'success');
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg = err?.error?.message || 'Falha ao duplicar restaurante no servidor.';
          this.showNotification(errorMsg, 'error');
        }
      })
    );
  }

  /**
   * Retrieves branch from local reactive state.
   */
  public getBranchByIdentifier(idOrIdentifier: string): Branch | undefined {
    return this.branches().find(b => 
      (b.id && String(b.id).toLowerCase() === idOrIdentifier.toLowerCase()) ||
      (b.identifier && b.identifier.toLowerCase() === idOrIdentifier.toLowerCase())
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

  /**
   * Reloads state freshly from the backend API.
   */
  public resetToDefault(): void {
    this.loadData().subscribe({
      next: () => {
        this.showNotification('Dados recarregados a partir do servidor backend.', 'info');
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
}

