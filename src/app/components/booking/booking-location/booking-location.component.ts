import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DataService } from '../../../services/data';
import { CommonModule } from '@angular/common';
import { Branch } from '../../../interfaces/DTO';

@Component({
  selector: 'app-booking-location',
  imports: [CommonModule],
  templateUrl: './booking-location.html',
  styleUrl: './booking-location.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class bookingLocationComponent {
  private dataService = inject(DataService);

  branches = signal<Branch[]>([]);

  ngOnInit() {
    this.dataService.getBranches().subscribe((data: any) => {
      this.branches.set(data);
    });
  }
}
