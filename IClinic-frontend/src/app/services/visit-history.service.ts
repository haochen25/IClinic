import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PatientVisitHistory } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class VisitHistoryService {
  private readonly base = `${environment.apiBase}/visit-history`;

  constructor(private readonly http: HttpClient) {}

  listByPatient(patientId: number): Observable<PatientVisitHistory[]> {
    const params = new HttpParams().set('patientId', String(patientId));
    return this.http
      .get<PatientVisitHistory[]>(`${this.base}/by-patient`, { params })
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
