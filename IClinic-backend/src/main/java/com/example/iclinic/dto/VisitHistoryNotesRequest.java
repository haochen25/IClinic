package com.example.iclinic.dto;

public record VisitHistoryNotesRequest(
        String chiefComplaint,
        String diagnosis,
        String notes) {
}
