import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DataService } from '../../services/data';
import { CommonModule } from '@angular/common';
import { Branch, SocialMedia } from '../../interfaces/DTO';



@Component({
  selector: 'app-contact',
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent {
  private dataService = inject(DataService);

  branches = signal<Branch[]>([]);

  ngOnInit() {
    this.dataService.getBranches().subscribe((data: any) => {
      this.branches.set(data);
    });
  }
}
