import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  public branchService = inject(BranchService);

  public openBranchPicker(): void {
    this.branchService.openBranchPicker();
  }
}
