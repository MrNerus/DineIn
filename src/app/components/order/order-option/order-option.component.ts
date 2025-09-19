import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DataService } from '../../../services/data';
import { CommonModule } from '@angular/common';
import { Branch, SocialMedia } from '../../../interfaces/DTO';



@Component({
  selector: 'app-order-option',
  imports: [CommonModule],
  templateUrl: './order-option.html',
  styleUrl: './order-option.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderOptionComponent {
  private dataService = inject(DataService);

  ngOnInit() {

  }
}
