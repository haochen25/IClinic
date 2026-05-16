import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Doctor, PatientVisitHistory } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private readonly base = `${environment.apiBase}/doctors`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.base).pipe(catchError(this.mapError));
  }

  createVisitHistoryNote(
    doctorId: number,
    patientId: number,
    body: { chiefComplaint: string | null; diagnosis: string | null; notes: string | null },
  ): Observable<PatientVisitHistory> {
    return this.http
      .post<PatientVisitHistory>(`${this.base}/${doctorId}/patients/${patientId}/visit-history-notes`, body)
      .pipe(catchError(this.mapError));
  }

  updateVisitHistory(
    doctorId: number,
    visitId: number,
    body: { chiefComplaint: string | null; diagnosis: string | null; notes: string | null },
  ): Observable<PatientVisitHistory> {
    return this.http
      .put<PatientVisitHistory>(`${this.base}/${doctorId}/visit-history/${visitId}/notes`, body)
      .pipe(catchError(this.mapError));
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
