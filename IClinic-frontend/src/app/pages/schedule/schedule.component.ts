import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentService } from '../../services/appointment.service';
import { DoctorService } from '../../services/doctor.service';
import { PatientService } from '../../services/patient.service';
import { Appointment, Doctor, Patient } from '../../models/api.types';
import {
  AppointmentDialogComponent,
  AppointmentDialogData,
} from '../appointment-dialog/appointment-dialog.component';

interface TimeSlot {
  label: string;
  start: Date;
  end: Date;
  appointments: Appointment[];
}

function toLocalIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  );
}

function formatApiDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit {
  private readonly appointmentsApi = inject(AppointmentService);
  private readonly patientsApi = inject(PatientService);
  private readonly doctorsApi = inject(DoctorService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly dateControl = new FormControl<Date>(new Date(), { nonNullable: true });

  loading = true;
  error: string | null = null;
  appointments: Appointment[] = [];
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  slots: TimeSlot[] = [];

  ngOnInit(): void {
    this.patientsApi.list().subscribe({
      next: (p) => (this.patients = p),
      error: () => {},
    });
    this.doctorsApi.list().subscribe({
      next: (d) => (this.doctors = d),
      error: () => {},
    });

    this.dateControl.valueChanges.subscribe(() => this.refresh());
    this.refresh();
  }

  refresh(): void {
    const d = this.dateControl.getRawValue();
    if (!d) {
      return;
    }
    this.loading = true;
    this.error = null;
    const iso = formatApiDate(d);
    this.appointmentsApi.listByDate(iso).subscribe({
      next: (rows) => {
        this.appointments = rows;
        this.slots = this.buildSlots(d, rows);
        this.loading = false;
      },
      error: (err: Error) => {
        this.loading = false;
        this.error = err.message;
      },
    });
  }

  private buildSlots(day: Date, appts: Appointment[]): TimeSlot[] {
    const base = new Date(day);
    base.setHours(0, 0, 0, 0);
    const result: TimeSlot[] = [];
    for (let mins = 8 * 60; mins < 18 * 60; mins += 30) {
      const start = new Date(base);
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      start.setHours(h, m, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 30);
      const label = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
      const overlapping = appts.filter((a) => {
        const aStart = new Date(a.scheduledStart).getTime();
        const aEnd = new Date(a.scheduledEnd).getTime();
        return aStart < end.getTime() && aEnd > start.getTime();
      });
      result.push({ label, start, end, appointments: overlapping });
    }
    return result;
  }

  openSlot(slot: TimeSlot): void {
    if (slot.appointments.length > 0) {
      const first = slot.appointments[0];
      void this.router.navigate(['/patients', first.patient.id], { queryParams: { appointmentId: first.id } });
      return;
    }
    if (this.patients.length === 0) {
      this.error = 'Add at least one patient before booking.';
      return;
    }
    if (this.doctors.length === 0) {
      this.error = 'No doctors found. Add a doctor in the database before booking.';
      return;
    }
    const data: AppointmentDialogData = {
      scheduledStart: toLocalIso(slot.start),
      scheduledEnd: toLocalIso(slot.end),
      patients: this.patients,
      doctors: this.doctors,
    };
    const ref = this.dialog.open(AppointmentDialogComponent, {
      width: '480px',
      data,
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refresh();
      }
    });
  }
}
