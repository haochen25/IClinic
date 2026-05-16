import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Patient } from '../../models/api.types';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.scss',
})
export class PatientSearchComponent implements OnInit {
  private readonly patientsApi = inject(PatientService);

  readonly query = signal('');
  readonly patients = signal<Patient[]>([]);
  readonly filtered = computed(() => {
    const value = this.query().trim().toLowerCase();
    if (!value) {
      return this.patients();
    }
    return this.patients().filter((patient) => this.searchText(patient).includes(value));
  });

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.patientsApi.list().subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.loading = false;
      },
      error: (err: Error) => {
        this.loading = false;
        this.error = err.message;
      },
    });
  }

  updateQuery(value: string): void {
    this.query.set(value);
  }

  private searchText(patient: Patient): string {
    return [
      patient.patientCode,
      patient.firstName,
      patient.lastName,
      patient.dateOfBirth,
      patient.email,
      patient.phone,
      patient.city,
      patient.insuranceProvider,
      patient.insuranceMemberId,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }
}
