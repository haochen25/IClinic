import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Patient, PatientRegistration } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly base = `${environment.apiBase}/patients`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.base).pipe(catchError(this.mapError));
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.base}/${id}`).pipe(catchError(this.mapError));
  }

  create(body: PatientRegistration): Observable<Patient> {
    return this.http.post<Patient>(this.base, body).pipe(catchError(this.mapError));
  }

  update(id: number, body: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.base}/${id}`, body).pipe(catchError(this.mapError));
  }

  private mapError(err: HttpErrorResponse): Observable<never> {
    const msg =
      err.error?.message ??
      (typeof err.error === 'string' ? err.error : null) ??
      err.message ??
      'Request failed';
    return throwError(() => new Error(msg));
  }
}
