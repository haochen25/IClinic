package com.example.iclinic.service;

import com.example.iclinic.model.PatientVisitHistory;
import com.example.iclinic.repository.PatientVisitHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class PatientVisitHistoryService {

    private final PatientVisitHistoryRepository patientVisitHistoryRepository;

    public PatientVisitHistoryService(PatientVisitHistoryRepository patientVisitHistoryRepository) {
        this.patientVisitHistoryRepository = patientVisitHistoryRepository;
    }

    public List<PatientVisitHistory> findAll() {
        return patientVisitHistoryRepository.findAll();
    }

    public List<PatientVisitHistory> findByPatientId(Long patientId) {
        return patientVisitHistoryRepository.findByPatient_IdOrderByVisitDateTimeDesc(patientId);
    }

    public Optional<PatientVisitHistory> findById(Long id) {
        return patientVisitHistoryRepository.findById(id);
    }

    @Transactional
    public PatientVisitHistory save(PatientVisitHistory visitHistory) {
        return patientVisitHistoryRepository.save(visitHistory);
    }

    @Transactional
    public void deleteById(Long id) {
        patientVisitHistoryRepository.deleteById(id);
    }
}
