package com.example.iclinic.repository;

import com.example.iclinic.model.PatientVisitHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatientVisitHistoryRepository extends JpaRepository<PatientVisitHistory, Long> {

    List<PatientVisitHistory> findByPatient_IdOrderByVisitDateTimeDesc(Long patientId);
}
