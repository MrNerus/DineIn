import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DataService } from '../../services/data';
import { CommonModule } from '@angular/common';

export interface Branch {
  name: string;
  address: string;
  phone: string;
}

export interface SocialMedia {
  name: string;
  url: string;
}

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
  socialMedia = signal<SocialMedia[]>([]);

  constructor() {
    this.dataService.getBranches().subscribe((data: any) => {
      this.branches.set(data.locations);
      this.socialMedia.set(data.socialMedia);
    });
  }
}