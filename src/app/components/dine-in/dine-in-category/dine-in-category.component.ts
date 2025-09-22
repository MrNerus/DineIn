import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Branch } from '../../../interfaces/DTO';
import { DataService } from '../../../services/data';

@Component({
  selector: 'dine-in-category-app',
  imports: [],
  templateUrl: './dine-in-category.html',
  styleUrl: './dine-in-category.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DineInCategoryComponent {

  constructor(private route: ActivatedRoute) {}

  private dataService = inject(DataService);

  branch = signal<Partial<Branch>>({});
  branchId = signal<string>("");

  ngOnInit() {
    this.branchId.set(this.route.snapshot.paramMap.get('branchId')!);
    this.dataService.getBranches().subscribe((data: Branch[]) => {
      this.branch.set(data.find(branch => branch.identifier === this.branchId())!);
    });

  }
}
