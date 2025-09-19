import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DataService } from '../../services/data';
import { CommonModule } from '@angular/common';
import { Branch } from '../../interfaces/DTO';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-google-review',
  imports: [CommonModule],
  templateUrl: './google-review.html',
  styleUrl: './google-review.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoogleReviewComponent {
  constructor(private route: ActivatedRoute) {}

  private dataService = inject(DataService);

  branches = signal<Branch[]>([]);

  ngOnInit() {
    this.dataService.getBranches().subscribe((data: any) => {
      this.branches.set(data);
    });
  }
}
