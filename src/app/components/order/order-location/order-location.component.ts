import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DataService } from '../../../services/data';
import { CommonModule } from '@angular/common';

interface Branch {
  identifier: string;
  name: string;
  address: string;
  phone: string;
}

@Component({
  selector: 'app-order-location',
  imports: [CommonModule],
  templateUrl: './order-location.html',
  styleUrl: './order-location.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderLocationComponent {
  private dataService = inject(DataService);

  branches = signal<Branch[]>([]);

  ngOnInit() {
    this.dataService.getBranches().subscribe((data: any) => {
      this.branches.set(data.locations);
    });
  }
}
