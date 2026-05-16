package com.example.iclinic.service;

import com.example.iclinic.model.Patient;
import com.example.iclinic.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Optional<Patient> findById(Long id) {
        return patientRepository.findById(id);
    }

    public Optional<Patient> findByPatientCode(String patientCode) {
        return patientRepository.findByPatientCode(patientCode);
    }

    @Transactional
    public Patient save(Patient patient) {
        if (patient.getPatientCode() == null || patient.getPatientCode().isBlank()) {
            patient.setPatientCode(generatePatientCode());
        }
        return patientRepository.save(patient);
    }
    private String generatePatientCode() {
        return "PAT-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    @Transactional
    public void deleteById(Long id) {
        patientRepository.deleteById(id);
    }
}
