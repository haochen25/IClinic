import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PatientRegistration } from '../../models/api.types';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-register',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './patient-register.component.html',
  styleUrl: './patient-register.component.scss',
})
export class PatientRegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly patientsApi = inject(PatientService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    patientCode: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: ['UNKNOWN' as PatientRegistration['gender'], Validators.required],
    email: [''],
    phone: [''],
    addressLine1: [''],
    addressLine2: [''],
    city: [''],
    stateOrProvince: [''],
    postalCode: [''],
    country: [''],
    insuranceProvider: [''],
    insuranceMemberId: [''],
    insuranceGroupNumber: [''],
  });

  saving = false;
  message: string | null = null;
  error: string | null = null;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.message = null;
    this.error = null;
    this.patientsApi.create(this.toRequest()).subscribe({
      next: (patient) => {
        this.saving = false;
        this.message = 'Patient registered.';
        void this.router.navigate(['/patients', patient.id]);
      },
      error: (err: Error) => {
        this.saving = false;
        this.error = err.message;
      },
    });
  }

  private toRequest(): PatientRegistration {
    const value = this.form.getRawValue();
    return {
      patientCode: value.patientCode.trim(),
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      dateOfBirth: value.dateOfBirth,
      gender: value.gender,
      email: this.blankToNull(value.email),
      phone: this.blankToNull(value.phone),
      addressLine1: this.blankToNull(value.addressLine1),
      addressLine2: this.blankToNull(value.addressLine2),
      city: this.blankToNull(value.city),
      stateOrProvince: this.blankToNull(value.stateOrProvince),
      postalCode: this.blankToNull(value.postalCode),
      country: this.blankToNull(value.country),
      insuranceProvider: this.blankToNull(value.insuranceProvider),
      insuranceMemberId: this.blankToNull(value.insuranceMemberId),
      insuranceGroupNumber: this.blankToNull(value.insuranceGroupNumber),
      active: true,
      waitingRoomDate: null,
    };
  }

  private blankToNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

}
