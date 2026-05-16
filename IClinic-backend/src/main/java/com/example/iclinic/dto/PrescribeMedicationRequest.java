package com.example.iclinic.dto;

import java.time.LocalDate;

public record PrescribeMedicationRequest(
        Long patientId,
        String medicationName,
        String dosage,
        String instructions,
        LocalDate prescribedDate
) {
}
