import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DatabaseOperationResponse } from '../models/database.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/database`;

  injectSql(): Observable<DatabaseOperationResponse> {
    return this.http.post<DatabaseOperationResponse>(`${this.apiUrl}/inject-sql`, {});
  }

  getStatus(): Observable<DatabaseOperationResponse> {
    return this.http.get<DatabaseOperationResponse>(`${this.apiUrl}/status`);
  }
}
