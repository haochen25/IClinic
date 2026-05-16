package com.example.iclinic.controller;

import com.example.iclinic.dto.StaffCreateRequest;
import com.example.iclinic.dto.StaffLoginRequest;
import com.example.iclinic.dto.StaffLoginResponse;
import com.example.iclinic.model.Appointment;
import com.example.iclinic.model.Patient;
import com.example.iclinic.model.Staff;
import com.example.iclinic.service.AppointmentService;
import com.example.iclinic.service.PatientService;
import com.example.iclinic.service.StaffService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;
    private final AppointmentService appointmentService;
    private final PatientService patientService;

    public StaffController(
            StaffService staffService,
            AppointmentService appointmentService,
            PatientService patientService) {
        this.staffService = staffService;
        this.appointmentService = appointmentService;
        this.patientService = patientService;
    }

    @PostMapping("/login")
    public StaffLoginResponse login(@RequestBody StaffLoginRequest request) {
        return staffService.login(request);
    }

    @GetMapping
    public List<Staff> getAll() {
        return staffService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Staff> getById(@PathVariable Long id) {
        return staffService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-username")
    public ResponseEntity<Staff> getByUsername(@RequestParam String username) {
        return staffService.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Staff> create(@RequestBody StaffCreateRequest request) {
        if (!isAuthenticated() && staffService.hasAnyStaff()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Staff creation requires sign in");
        }
        Staff saved = staffService.register(request);
        return ResponseEntity.created(URI.create("/api/staff/" + saved.getId())).body(saved);
    }

    private static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Staff> update(@PathVariable Long id, @RequestBody Staff staff) {
        if (staffService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        staff.setId(id);
        return ResponseEntity.ok(staffService.save(staff));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (staffService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        staffService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/appointments")
    public ResponseEntity<Appointment> addAppointment(@RequestBody Appointment appointment) {
        Appointment saved = appointmentService.save(appointment);
        return ResponseEntity.created(URI.create("/api/appointments/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/appointments/{appointmentId}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long appointmentId) {
        if (appointmentService.findById(appointmentId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        appointmentService.deleteById(appointmentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/patients/register")
    public ResponseEntity<Patient> registerPatient(@RequestBody Patient patient) {
        Patient saved = patientService.save(patient);
        return ResponseEntity.created(URI.create("/api/patients/" + saved.getId())).body(saved);
    }
}
