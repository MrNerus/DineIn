import { ChangeDetectionStrategy, Component, inject, AfterViewInit, signal } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../../services/data';
import { Branch } from '../../interfaces/DTO';


@Component({
  selector: 'app-location',
  imports: [],
  templateUrl: './location.html',
  styleUrl: './location.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationComponent implements AfterViewInit {
  private dataService = inject(DataService);
  branches = signal<Branch[]>([]);

  ngOnInit() {
    this.dataService.getBranches().subscribe((data: any) => {
      this.branches.set(data);
    });
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 1000);
  }
  
  private initMap(): void {
    this.branches().forEach(branch => {
      const map = L.map(`map-${branch.identifier}`).setView([branch.lat, branch.long], 10);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      L.marker([branch.lat, branch.long])
        .addTo(map)
        .bindPopup(`<b>${branch.name}</b><br>${branch.address}`)
        .openPopup();
    });
  }
}