import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Branch } from '../../../interfaces/DTO';
import { ManagementService } from '../../../services/management.service';

@Component({
  selector: 'app-management-branches',
  imports: [FormsModule],
  templateUrl: './management-branches.html',
  styleUrl: './management-branches.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementBranchesComponent {
  public managementService = inject(ManagementService);
  private router = inject(Router);

  public readonly searchQuery = signal<string>('');
  public readonly branchToDelete = signal<Branch | null>(null);
  public readonly isDeleteModalOpen = signal<boolean>(false);

  public readonly filteredBranches = computed<Branch[]>(() => {
    const list = this.managementService.branches();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return list;

    return list.filter(b => 
      b.name.toLowerCase().includes(query) ||
      b.identifier.toLowerCase().includes(query) ||
      (b.id && String(b.id).toLowerCase().includes(query)) ||
      b.address.toLowerCase().includes(query) ||
      b.phone.toLowerCase().includes(query)
    );
  });

  public onSearchChange(term: string): void {
    this.searchQuery.set(term);
  }

  public createNewBranch(): void {
    const placeholder = this.managementService.createDefaultBranch();
    const targetKey = placeholder.id || placeholder.identifier;
    this.router.navigate(['/management/branches/edit', targetKey]);
  }

  public toggleStatus(branch: Branch, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const targetKey = branch.id ? String(branch.id) : branch.identifier;
    this.managementService.toggleBranchStatus(targetKey);
  }

  public editBranch(branch: Branch): void {
    const targetKey = branch.id ? String(branch.id) : branch.identifier;
    this.router.navigate(['/management/branches/edit', targetKey]);
  }

  public duplicateBranch(branch: Branch): void {
    const targetKey = branch.id ? String(branch.id) : branch.identifier;
    this.managementService.duplicateBranch(targetKey);
  }

  public openDeleteModal(branch: Branch): void {
    this.branchToDelete.set(branch);
    this.isDeleteModalOpen.set(true);
  }

  public closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.branchToDelete.set(null);
  }

  public confirmDelete(): void {
    const target = this.branchToDelete();
    if (target) {
      const targetKey = target.id ? String(target.id) : target.identifier;
      this.managementService.deleteBranch(targetKey);
      this.closeDeleteModal();
    }
  }
}

