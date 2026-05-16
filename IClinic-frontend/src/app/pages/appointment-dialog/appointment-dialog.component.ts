import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AppointmentService } from '../../services/appointment.service';
import { Doctor, Patient } from '../../models/api.types';

export interface AppointmentDialogData {
  scheduledStart: string;
  scheduledEnd: string;
  patients: Patient[];
  doctors: Doctor[];
}

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrl: './appointment-dialog.component.scss',
})
export class AppointmentDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AppointmentDialogComponent, boolean>);
  private readonly appointmentsApi = inject(AppointmentService);
  readonly data = inject<AppointmentDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    patientId: [null as number | null, Validators.required],
    doctorId: [null as number | null, Validators.required],
    reason: [''],
  });

  error: string | null = null;
  saving = false;

  cancel(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (this.form.invalid || !this.data) {
      return;
    }
    const v = this.form.getRawValue();
    if (v.patientId == null || v.doctorId == null) {
      return;
    }
    this.error = null;
    this.saving = true;
    this.appointmentsApi
      .create({
        patient: { id: v.patientId },
        doctor: { id: v.doctorId },
        scheduledStart: this.data.scheduledStart,
        scheduledEnd: this.data.scheduledEnd,
        status: 'SCHEDULED',
        reason: v.reason?.trim() || null,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.dialogRef.close(true);
        },
        error: (err: Error) => {
          this.saving = false;
          this.error = err.message;
        },
      });
  }
}
