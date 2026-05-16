package com.example.iclinic.service;

import com.example.iclinic.dto.PrescribeMedicationRequest;
import com.example.iclinic.model.Doctor;
import com.example.iclinic.model.Medication;
import com.example.iclinic.model.Patient;
import com.example.iclinic.model.PatientVisitHistory;
import com.example.iclinic.repository.DoctorRepository;
import com.example.iclinic.repository.MedicationRepository;
import com.example.iclinic.repository.PatientRepository;
import com.example.iclinic.repository.PatientVisitHistoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PatientVisitHistoryRepository patientVisitHistoryRepository;
    private final PatientRepository patientRepository;
    private final MedicationRepository medicationRepository;

    public DoctorService(
            DoctorRepository doctorRepository,
            PatientVisitHistoryRepository patientVisitHistoryRepository,
            PatientRepository patientRepository,
            MedicationRepository medicationRepository) {
        this.doctorRepository = doctorRepository;
        this.patientVisitHistoryRepository = patientVisitHistoryRepository;
        this.patientRepository = patientRepository;
        this.medicationRepository = medicationRepository;
    }

    public List<Doctor> findAll() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> findById(Long id) {
        return doctorRepository.findById(id);
    }

    public Optional<Doctor> findByUsername(String username) {
        return doctorRepository.findByUsername(username);
    }

    @Transactional
    public PatientVisitHistory writeVisitHistoryNotes(
            Long doctorId,
            Long visitHistoryId,
            String chiefComplaint,
            String diagnosis,
            String notes) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        PatientVisitHistory visit = patientVisitHistoryRepository.findById(visitHistoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Visit history not found"));
        Doctor seenBy = visit.getSeenByDoctor();
        if (seenBy == null || !seenBy.getId().equals(doctor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Visit is not assigned to this doctor");
        }
        visit.setChiefComplaint(blankToNull(chiefComplaint));
        visit.setDiagnosis(blankToNull(diagnosis));
        visit.setNotes(blankToNull(notes));
        return patientVisitHistoryRepository.save(visit);
    }

    @Transactional
    public PatientVisitHistory createVisitHistoryNote(
            Long doctorId,
            Long patientId,
            String chiefComplaint,
            String diagnosis,
            String notes) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        if (isBlank(chiefComplaint) && isBlank(diagnosis) && isBlank(notes)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "visit details are required");
        }

        PatientVisitHistory visit = new PatientVisitHistory();
        visit.setPatient(patient);
        visit.setSeenByDoctor(doctor);
        visit.setVisitDateTime(LocalDateTime.now());
        visit.setChiefComplaint(blankToNull(chiefComplaint));
        visit.setDiagnosis(blankToNull(diagnosis));
        visit.setNotes(blankToNull(notes));
        return patientVisitHistoryRepository.save(visit);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    @Transactional
    public Medication prescribeMedication(Long doctorId, PrescribeMedicationRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        if (request.patientId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "patientId is required");
        }
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        if (request.medicationName() == null || request.medicationName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "medicationName is required");
        }
        if (request.prescribedDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prescribedDate is required");
        }
        Medication medication = new Medication();
        medication.setPatient(patient);
        medication.setPrescribedByDoctor(doctor);
        medication.setMedicationName(request.medicationName().trim());
        medication.setDosage(request.dosage());
        medication.setInstructions(request.instructions());
        medication.setPrescribedDate(request.prescribedDate());
        return medicationRepository.save(medication);
    }

    @Transactional
    public Doctor save(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteById(Long id) {
        doctorRepository.deleteById(id);
    }
}
