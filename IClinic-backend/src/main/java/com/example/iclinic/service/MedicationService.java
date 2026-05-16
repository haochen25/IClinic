package com.example.iclinic.service;

import com.example.iclinic.model.Medication;
import com.example.iclinic.repository.MedicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class MedicationService {

    private final MedicationRepository medicationRepository;

    public MedicationService(MedicationRepository medicationRepository) {
        this.medicationRepository = medicationRepository;
    }

    public List<Medication> findAll() {
        return medicationRepository.findAll();
    }

    public Optional<Medication> findById(Long id) {
        return medicationRepository.findById(id);
    }

    @Transactional
    public Medication save(Medication medication) {
        return medicationRepository.save(medication);
    }

    @Transactional
    public void deleteById(Long id) {
        medicationRepository.deleteById(id);
    }
}
