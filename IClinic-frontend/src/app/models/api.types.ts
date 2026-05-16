export type StaffRole =
  | 'DOCTOR'
  | 'RECEPTION'
  | 'NURSE'
  | 'BILLING'
  | 'ADMIN'
  | 'OTHER';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface StaffLoginResponse {
  id: number;
  username: string;
  role: StaffRole;
  firstName: string;
  lastName: string;
  email: string | null;
  active: boolean;
  specialty: string | null;
  token: string;
}

export interface Patient {
  id: number;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateOrProvince: string | null;
  postalCode: string | null;
  country: string | null;
  insuranceProvider: string | null;
  insuranceMemberId: string | null;
  insuranceGroupNumber: string | null;
  active: boolean;
  waitingRoomDate: string | null;
}

export type PatientRegistration = Omit<Patient, 'id'>;

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: StaffRole;
  npiNumber?: string;
  specialty: string | null;
}

export interface Appointment {
  id: number;
  patient: Patient;
  doctor: Doctor;
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  active: boolean;
}

export interface PatientVisitHistory {
  id: number;
  seenByDoctor: Doctor | null;
  visitDateTime: string;
  chiefComplaint: string | null;
  diagnosis: string | null;
  notes: string | null;
}

export interface StaffRegistration {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  role: StaffRole;
  username: string;
  passwordHash: string;
  /** Required when role is DOCTOR */
  npiNumber?: string | null;
  /** Required when role is DOCTOR */
  specialty?: string | null;
}
