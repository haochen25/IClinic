import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/api.types';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.scss',
})
export class WaitingRoomComponent implements OnInit {
  private readonly appointmentsApi = inject(AppointmentService);

  loading = true;
  error: string | null = null;
  waiting: Appointment[] = [];
  readonly dateControl = new FormControl<string>(this.todayIso(), { nonNullable: true });

  ngOnInit(): void {
    this.dateControl.valueChanges.subscribe(() => this.load());
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.appointmentsApi.listWaitingRoomByDate(this.dateControl.getRawValue()).subscribe({
      next: (rows) => {
        this.waiting = rows;
        this.loading = false;
      },
      error: (err: Error) => {
        this.loading = false;
        this.error = err.message;
      },
    });
  }

  private todayIso(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }
}
