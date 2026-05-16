package com.example.iclinic.controller;

import com.example.iclinic.model.PatientVisitHistory;
import com.example.iclinic.service.PatientVisitHistoryService;
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

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/visit-history")
public class PatientVisitHistoryController {

    private final PatientVisitHistoryService patientVisitHistoryService;

    public PatientVisitHistoryController(PatientVisitHistoryService patientVisitHistoryService) {
        this.patientVisitHistoryService = patientVisitHistoryService;
    }

    @GetMapping
    public List<PatientVisitHistory> getAll() {
        return patientVisitHistoryService.findAll();
    }

    @GetMapping("/by-patient")
    public List<PatientVisitHistory> getByPatient(@RequestParam Long patientId) {
        return patientVisitHistoryService.findByPatientId(patientId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientVisitHistory> getById(@PathVariable Long id) {
        return patientVisitHistoryService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PatientVisitHistory> create(@RequestBody PatientVisitHistory visitHistory) {
        PatientVisitHistory saved = patientVisitHistoryService.save(visitHistory);
        return ResponseEntity.created(URI.create("/api/visit-history/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientVisitHistory> update(@PathVariable Long id, @RequestBody PatientVisitHistory visitHistory) {
        if (patientVisitHistoryService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        visitHistory.setId(id);
        return ResponseEntity.ok(patientVisitHistoryService.save(visitHistory));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (patientVisitHistoryService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        patientVisitHistoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
