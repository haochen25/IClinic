import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { StaffService } from '../../services/staff.service';
import { StaffRole } from '../../models/api.types';

const REGISTER_ROLES: StaffRole[] = ['DOCTOR', 'RECEPTION', 'NURSE', 'BILLING', 'ADMIN', 'OTHER'];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly staff = inject(StaffService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private roleSub?: Subscription;

  readonly roleOptions = REGISTER_ROLES;
  readonly backLink = this.auth.isLoggedIn() ? '/waiting-room' : '/login';

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [''],
    phone: [''],
    role: this.fb.nonNullable.control<StaffRole>('RECEPTION', Validators.required),
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    npiNumber: [''],
    specialty: [''],
  });

  errorMessage: string | null = null;
  loading = false;

  ngOnInit(): void {
    this.applyDoctorValidators(this.form.controls.role.getRawValue());
    this.roleSub = this.form.controls.role.valueChanges.subscribe((role) => this.applyDoctorValidators(role));
  }

  ngOnDestroy(): void {
    this.roleSub?.unsubscribe();
  }

  private applyDoctorValidators(role: StaffRole): void {
    const npi = this.form.controls.npiNumber;
    const spec = this.form.controls.specialty;
    if (role === 'DOCTOR') {
      npi.setValidators([Validators.required, Validators.pattern(/^\d{10}$/)]);
      spec.setValidators([Validators.required, Validators.maxLength(120)]);
    } else {
      npi.clearValidators();
      spec.clearValidators();
      npi.setValue('', { emitEvent: false });
      spec.setValue('', { emitEvent: false });
    }
    npi.updateValueAndValidity({ emitEvent: false });
    spec.updateValueAndValidity({ emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.errorMessage = null;
    this.loading = true;
    const v = this.form.getRawValue();
    const payload = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email?.trim() || null,
      phone: v.phone?.trim() || null,
      role: v.role,
      username: v.username.trim().toLowerCase(),
      passwordHash: v.password,
      ...(v.role === 'DOCTOR'
        ? { npiNumber: v.npiNumber.trim(), specialty: v.specialty.trim() }
        : {}),
    };
    this.staff.register(payload).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigateByUrl(this.auth.isLoggedIn() ? '/waiting-room' : '/login');
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMessage = err.message;
      },
    });
  }
}
