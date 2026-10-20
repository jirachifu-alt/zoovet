import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicalRecord, MedicalRecordCreateDto } from '../models/medical-record.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/medical-records`;

  getAll(petId: number | null = null): Observable<MedicalRecord[]> {
    let params = new HttpParams();
    if (petId) {
      params = params.set('petId', petId.toString());
    }
    return this.http.get<MedicalRecord[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.apiUrl}/${id}`);
  }

  create(recordData: MedicalRecordCreateDto): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(this.apiUrl, recordData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
