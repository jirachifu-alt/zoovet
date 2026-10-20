import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pet, PetCreateOrUpdateDto } from '../models/pet.model';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pets`;

  getAll(params: { ownerId?: number; search?: string } = {}): Observable<Pet[]> {
    let httpParams = new HttpParams();
    if (params.ownerId) {
      httpParams = httpParams.set('ownerId', params.ownerId.toString());
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<Pet[]>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/${id}`);
  }

  create(petData: PetCreateOrUpdateDto): Observable<Pet> {
    return this.http.post<Pet>(this.apiUrl, petData);
  }

  update(id: number, petData: PetCreateOrUpdateDto): Observable<Pet> {
    return this.http.put<Pet>(`${this.apiUrl}/${id}`, petData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
