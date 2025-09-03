import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);

  getMenu(): Observable<any> {
    return this.http.get('assets/data/menu.json');
  }

  getBranches(): Observable<any> {
    return this.http.get('assets/data/branches.json');
  }
}