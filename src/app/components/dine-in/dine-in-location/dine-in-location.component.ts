import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DataService } from '../../../services/data';
import { CommonModule } from '@angular/common';
import { Branch } from '../../../interfaces/DTO';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dine-in-location',
  imports: [CommonModule],
  templateUrl: './dine-in-location.html',
  styleUrl: './dine-in-location.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DineInLocationComponent {
  constructor(private route: ActivatedRoute) {}

  private dataService = inject(DataService);

  branches = signal<Branch[]>([]);

  ngOnInit() {
    this.dataService.getBranches().subscribe((data: any) => {
      this.branches.set(data);
    });
  }
}
