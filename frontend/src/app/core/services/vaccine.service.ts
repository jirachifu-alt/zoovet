import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VaccineRecord, VaccineRecordCreateDto } from '../models/vaccine.model';

@Injectable({
  providedIn: 'root'
})
export class VaccineService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vaccines`;

  getAll(petId: number | null = null): Observable<VaccineRecord[]> {
    let params = new HttpParams();
    if (petId) {
      params = params.set('petId', petId.toString());
    }
    return this.http.get<VaccineRecord[]>(this.apiUrl, { params });
  }

  create(vaccineData: VaccineRecordCreateDto): Observable<VaccineRecord> {
    return this.http.post<VaccineRecord>(this.apiUrl, vaccineData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
