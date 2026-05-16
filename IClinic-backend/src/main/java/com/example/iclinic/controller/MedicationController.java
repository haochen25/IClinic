package com.example.iclinic.controller;

import com.example.iclinic.model.Medication;
import com.example.iclinic.service.MedicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/medications")
public class MedicationController {

    private final MedicationService medicationService;

    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @GetMapping
    public List<Medication> getAll() {
        return medicationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medication> getById(@PathVariable Long id) {
        return medicationService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Medication> create(@RequestBody Medication medication) {
        Medication saved = medicationService.save(medication);
        return ResponseEntity.created(URI.create("/api/medications/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medication> update(@PathVariable Long id, @RequestBody Medication medication) {
        if (medicationService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        medication.setId(id);
        return ResponseEntity.ok(medicationService.save(medication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (medicationService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        medicationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
