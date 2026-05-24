import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantHistoryMessage {
  content: string;
}

interface AssistantChatResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  private readonly base = `${environment.apiBase}/assistant`;

  constructor(private readonly http: HttpClient) {}

  chat(message: string, history: AssistantMessage[]): Observable<AssistantChatResponse> {
    const assistantHistory: AssistantHistoryMessage[] = history.map(({ content }) => ({ content }));
    return this.http
      .post<AssistantChatResponse>(`${this.base}/chat`, { message, history: assistantHistory })
      .pipe(catchError(this.mapError));
  }

  private mapError(err: HttpErrorResponse): Observable<never> {
    const msg =
      err.error?.message ??
      (typeof err.error === 'string' ? err.error : null) ??
      err.message ??
      'Assistant request failed';
    return throwError(() => new Error(msg));
  }
}
