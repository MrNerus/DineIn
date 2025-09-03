import { ChangeDetectionStrategy, Component, inject, AfterViewInit, signal } from '@angular/core';
import { DataService } from '../../services/data';
import * as L from 'leaflet';

export interface Location {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-location',
  imports: [],
  templateUrl: './location.html',
  styleUrl: './location.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationComponent implements AfterViewInit {
  private dataService = inject(DataService);
  locations = signal<Location[]>([]);

  ngAfterViewInit() {
    this.dataService.getBranches().subscribe((data: any) => {
      this.locations.set(data.locations);
      this.initMap();
    });
  }

  private initMap(): void {
    const map = L.map('map').setView([34.052235, -118.243683], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    this.locations().forEach(location => {
      L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(`<b>${location.name}</b><br>${location.address}`)
        .openPopup();
    });
  }
}