import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Branch, CategoryItem, Company } from '../interfaces/DTO';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);

  getCompany(): Observable<Company> {
    return this.http.get<Company>('assets/data/branches.json');
  }
}