package com.example.iclinic.controller;

import com.example.iclinic.dto.PrescribeMedicationRequest;
import com.example.iclinic.dto.StaffCreateRequest;
import com.example.iclinic.dto.VisitHistoryNotesRequest;
import com.example.iclinic.model.Doctor;
import com.example.iclinic.model.Medication;
import com.example.iclinic.model.PatientVisitHistory;
import com.example.iclinic.model.Staff;
import com.example.iclinic.model.StaffRole;
import com.example.iclinic.service.DoctorService;
import com.example.iclinic.service.StaffService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final StaffService staffService;

    public DoctorController(DoctorService doctorService, StaffService staffService) {
        this.doctorService = doctorService;
        this.staffService = staffService;
    }

    @GetMapping
    public List<Doctor> getAll() {
        return doctorService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getById(@PathVariable Long id) {
        return doctorService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-username")
    public ResponseEntity<Doctor> getByUsername(@RequestParam String username) {
        return doctorService.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Staff> create(@RequestBody StaffCreateRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request body is required");
        }
        if (request.role() != StaffRole.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "role must be DOCTOR");
        }
        Staff saved = staffService.register(request);
        return ResponseEntity.created(URI.create("/api/doctors/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Staff> update(@PathVariable Long id, @RequestBody Doctor doctor) {
        if (doctorService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        doctor.setId(id);
        doctor.setRole(StaffRole.DOCTOR);
        return ResponseEntity.ok(staffService.save(doctor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (doctorService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        doctorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{doctorId}/visit-history/{visitId}/notes")
    public ResponseEntity<PatientVisitHistory> writeVisitHistoryNotes(
            @PathVariable Long doctorId,
            @PathVariable Long visitId,
            @RequestBody VisitHistoryNotesRequest request) {
        PatientVisitHistory updated = doctorService.writeVisitHistoryNotes(
                doctorId,
                visitId,
                request.chiefComplaint(),
                request.diagnosis(),
                request.notes());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{doctorId}/patients/{patientId}/visit-history-notes")
    public ResponseEntity<PatientVisitHistory> createVisitHistoryNote(
            @PathVariable Long doctorId,
            @PathVariable Long patientId,
            @RequestBody VisitHistoryNotesRequest request) {
        PatientVisitHistory saved = doctorService.createVisitHistoryNote(
                doctorId,
                patientId,
                request.chiefComplaint(),
                request.diagnosis(),
                request.notes());
        return ResponseEntity.created(URI.create("/api/visit-history/" + saved.getId())).body(saved);
    }

    @PostMapping("/{doctorId}/medications")
    public ResponseEntity<Medication> prescribeMedication(
            @PathVariable Long doctorId,
            @RequestBody PrescribeMedicationRequest request) {
        Medication saved = doctorService.prescribeMedication(doctorId, request);
        return ResponseEntity.created(URI.create("/api/medications/" + saved.getId())).body(saved);
    }
}
