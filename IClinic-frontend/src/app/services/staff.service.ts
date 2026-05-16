import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { StaffLoginResponse, StaffRegistration } from '../models/api.types';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private readonly base = `${environment.apiBase}/staff`;

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<StaffLoginResponse> {
    return this.http
      .post<StaffLoginResponse>(`${this.base}/login`, { username, password })
      .pipe(catchError(this.mapError));
  }

  register(body: StaffRegistration): Observable<unknown> {
    return this.http.post(`${this.base}`, body).pipe(catchError(this.mapError));
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
