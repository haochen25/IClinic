import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Appointment, AppointmentStatus } from '../models/api.types';

export interface CreateAppointmentBody {
  patient: { id: number };
  doctor: { id: number };
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
  active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly base = `${environment.apiBase}/appointments`;

  constructor(private readonly http: HttpClient) {}

  listByDate(isoDate: string): Observable<Appointment[]> {
    const params = new HttpParams().set('date', isoDate);
    return this.http
      .get<Appointment[]>(`${this.base}/by-date`, { params })
      .pipe(catchError(this.mapError));
  }

  listWaitingRoomByDate(isoDate: string): Observable<Appointment[]> {
    const params = new HttpParams().set('date', isoDate);
    return this.http.get<Appointment[]>(`${this.base}/waiting-room`, { params }).pipe(catchError(this.mapError));
  }

  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.base}/${id}`).pipe(catchError(this.mapError));
  }

  create(body: CreateAppointmentBody): Observable<Appointment> {
    return this.http.post<Appointment>(this.base, body).pipe(catchError(this.mapError));
  }

  update(id: number, body: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.base}/${id}`, body).pipe(catchError(this.mapError));
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
