import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { DoctorService } from '../../services/doctor.service';
import { PatientService } from '../../services/patient.service';
import { VisitHistoryService } from '../../services/visit-history.service';
import { Appointment, Patient, PatientVisitHistory } from '../../models/api.types';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss',
})
export class PatientDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly appointmentsApi = inject(AppointmentService);
  private readonly doctorsApi = inject(DoctorService);
  private readonly patientsApi = inject(PatientService);
  private readonly visitsApi = inject(VisitHistoryService);
  private readonly fb = inject(FormBuilder);

  loading = true;
  error: string | null = null;
  patient: Patient | null = null;
  appointment: Appointment | null = null;
  visits: PatientVisitHistory[] = [];

  readonly insuranceForm = this.fb.nonNullable.group({
    insuranceProvider: [''],
    insuranceMemberId: [''],
    insuranceGroupNumber: [''],
  });
  readonly visitNoteForm = this.fb.nonNullable.group({
    chiefComplaint: ['', [Validators.maxLength(300)]],
    diagnosis: ['', [Validators.maxLength(500)]],
    notes: ['', [Validators.maxLength(2000)]],
  });
  readonly visitEditForm = this.fb.nonNullable.group({
    chiefComplaint: ['', [Validators.maxLength(300)]],
    diagnosis: ['', [Validators.maxLength(500)]],
    notes: ['', [Validators.maxLength(2000)]],
  });

  insuranceSaving = false;
  insuranceMessage: string | null = null;
  visitNoteSaving = false;
  visitNoteMessage: string | null = null;
  editingVisitId: number | null = null;
  visitEditSaving = false;
  visitEditMessage: string | null = null;
  statusSaving = false;
  statusMessage: string | null = null;

  get isDoctor(): boolean {
    return this.auth.getSession()?.role === 'DOCTOR';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) {
      void this.router.navigate(['/waiting-room']);
      return;
    }
    this.load(id);
    const appointmentId = Number(this.route.snapshot.queryParamMap.get('appointmentId'));
    if (!Number.isNaN(appointmentId)) {
      this.loadAppointment(appointmentId);
    }
  }

  private load(id: number): void {
    this.loading = true;
    this.error = null;
    this.patientsApi.getById(id).subscribe({
      next: (p) => {
        this.patient = p;
        this.insuranceForm.patchValue({
          insuranceProvider: p.insuranceProvider ?? '',
          insuranceMemberId: p.insuranceMemberId ?? '',
          insuranceGroupNumber: p.insuranceGroupNumber ?? '',
        });
        this.loading = false;
      },
      error: (err: Error) => {
        this.loading = false;
        this.error = err.message;
      },
    });
    this.visitsApi.listByPatient(id).subscribe({
      next: (v) => (this.visits = v),
      error: () => (this.visits = []),
    });
  }

  private loadAppointment(id: number): void {
    this.appointmentsApi.getById(id).subscribe({
      next: (appointment) => (this.appointment = appointment),
      error: () => (this.appointment = null),
    });
  }

  saveInsurance(): void {
    if (!this.patient) {
      return;
    }
    this.insuranceSaving = true;
    this.insuranceMessage = null;
    const v = this.insuranceForm.getRawValue();
    const body: Patient = {
      ...this.patient,
      insuranceProvider: v.insuranceProvider.trim() || null,
      insuranceMemberId: v.insuranceMemberId.trim() || null,
      insuranceGroupNumber: v.insuranceGroupNumber.trim() || null,
    };
    this.patientsApi.update(this.patient.id, body).subscribe({
      next: (p) => {
        this.patient = p;
        this.insuranceSaving = false;
        this.insuranceMessage = 'Insurance details saved.';
      },
      error: (err: Error) => {
        this.insuranceSaving = false;
        this.insuranceMessage = err.message;
      },
    });
  }

  saveVisitNote(): void {
    if (!this.patient || !this.isDoctor) {
      return;
    }
    const v = this.visitNoteForm.getRawValue();
    const body = {
      chiefComplaint: v.chiefComplaint.trim() || null,
      diagnosis: v.diagnosis.trim() || null,
      notes: v.notes.trim() || null,
    };
    if (this.visitNoteForm.invalid || (!body.chiefComplaint && !body.diagnosis && !body.notes)) {
      this.visitNoteForm.markAllAsTouched();
      this.visitNoteMessage = 'Enter visit details before saving.';
      return;
    }

    const doctorId = this.auth.getSession()?.id;
    if (!doctorId) {
      this.visitNoteMessage = 'Doctor session not found.';
      return;
    }

    this.visitNoteSaving = true;
    this.visitNoteMessage = null;
    this.doctorsApi.createVisitHistoryNote(doctorId, this.patient.id, body).subscribe({
      next: (visit) => {
        this.visits = [visit, ...this.visits];
        this.visitNoteForm.reset();
        this.visitNoteSaving = false;
        this.visitNoteMessage = 'Visit details saved.';
      },
      error: (err: Error) => {
        this.visitNoteSaving = false;
        this.visitNoteMessage = err.message;
      },
    });
  }

  canEditVisit(visit: PatientVisitHistory): boolean {
    const session = this.auth.getSession();
    return session?.role === 'DOCTOR' && visit.seenByDoctor?.id === session.id;
  }

  startEditVisit(visit: PatientVisitHistory): void {
    this.editingVisitId = visit.id;
    this.visitEditMessage = null;
    this.visitEditForm.patchValue({
      chiefComplaint: visit.chiefComplaint ?? '',
      diagnosis: visit.diagnosis ?? '',
      notes: visit.notes ?? '',
    });
  }

  cancelEditVisit(): void {
    this.editingVisitId = null;
    this.visitEditMessage = null;
    this.visitEditForm.reset();
  }

  saveVisitEdit(visit: PatientVisitHistory): void {
    const doctorId = this.auth.getSession()?.id;
    if (!doctorId || this.visitEditForm.invalid) {
      this.visitEditForm.markAllAsTouched();
      return;
    }

    const v = this.visitEditForm.getRawValue();
    const body = {
      chiefComplaint: v.chiefComplaint.trim() || null,
      diagnosis: v.diagnosis.trim() || null,
      notes: v.notes.trim() || null,
    };

    this.visitEditSaving = true;
    this.visitEditMessage = null;
    this.doctorsApi.updateVisitHistory(doctorId, visit.id, body).subscribe({
      next: (updated) => {
        this.visits = this.visits.map((item) => (item.id === updated.id ? updated : item));
        this.visitEditSaving = false;
        this.editingVisitId = null;
        this.visitEditForm.reset();
      },
      error: (err: Error) => {
        this.visitEditSaving = false;
        this.visitEditMessage = err.message;
      },
    });
  }

  toggleActiveStatus(): void {
    if (!this.appointment) {
      return;
    }

    const body: Appointment = {
      ...this.appointment,
      active: !this.appointment.active,
    };

    this.statusSaving = true;
    this.statusMessage = null;
    this.appointmentsApi.update(this.appointment.id, body).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.statusSaving = false;
        this.statusMessage = appointment.active
          ? 'Appointment marked active in the waiting room.'
          : 'Appointment removed from the waiting room.';
      },
      error: (err: Error) => {
        this.statusSaving = false;
        this.statusMessage = err.message;
      },
    });
  }
}
