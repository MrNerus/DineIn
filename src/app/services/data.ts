import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { Company } from '../interfaces/DTO';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  getCompany(): Observable<Company> {
    const apiUrl = `${this.configService.backend_url}/api/data.php?public=1`;
    return this.http.get<Company>(apiUrl).pipe(
      catchError((err) => {
        console.warn('Backend API data unavailable, falling back to static branches.json:', err);
        return this.http.get<Company>('assets/data/branches.json');
      })
    );
  }
}