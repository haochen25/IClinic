package com.example.iclinic.service;

import com.example.iclinic.dto.StaffCreateRequest;
import com.example.iclinic.dto.StaffLoginRequest;
import com.example.iclinic.dto.StaffLoginResponse;
import com.example.iclinic.model.BillingStaff;
import com.example.iclinic.model.ClinicAdmin;
import com.example.iclinic.model.Doctor;
import com.example.iclinic.model.NurseStaff;
import com.example.iclinic.model.OtherStaff;
import com.example.iclinic.model.ReceptionStaff;
import com.example.iclinic.model.Staff;
import com.example.iclinic.model.StaffRole;
import com.example.iclinic.repository.BillingStaffRepository;
import com.example.iclinic.repository.ClinicAdminRepository;
import com.example.iclinic.repository.DoctorRepository;
import com.example.iclinic.repository.NurseStaffRepository;
import com.example.iclinic.repository.OtherStaffRepository;
import com.example.iclinic.repository.ReceptionStaffRepository;
import com.example.iclinic.repository.StaffRepository;
import com.example.iclinic.security.AuthTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StaffService {

    private static final int MIN_PASSWORD_LENGTH = 8;

    private final StaffRepository staffRepository;
    private final DoctorRepository doctorRepository;
    private final NurseStaffRepository nurseStaffRepository;
    private final ReceptionStaffRepository receptionStaffRepository;
    private final BillingStaffRepository billingStaffRepository;
    private final ClinicAdminRepository clinicAdminRepository;
    private final OtherStaffRepository otherStaffRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    public StaffService(
            StaffRepository staffRepository,
            DoctorRepository doctorRepository,
            NurseStaffRepository nurseStaffRepository,
            ReceptionStaffRepository receptionStaffRepository,
            BillingStaffRepository billingStaffRepository,
            ClinicAdminRepository clinicAdminRepository,
            OtherStaffRepository otherStaffRepository,
            PasswordEncoder passwordEncoder,
            AuthTokenService authTokenService) {
        this.staffRepository = staffRepository;
        this.doctorRepository = doctorRepository;
        this.nurseStaffRepository = nurseStaffRepository;
        this.receptionStaffRepository = receptionStaffRepository;
        this.billingStaffRepository = billingStaffRepository;
        this.clinicAdminRepository = clinicAdminRepository;
        this.otherStaffRepository = otherStaffRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
    }

    public List<Staff> findAll() {
        return staffRepository.findAll();
    }

    public Optional<Staff> findById(Long id) {
        return staffRepository.findById(id);
    }

    public Optional<Staff> findByUsername(String username) {
        return staffRepository.findByUsername(username);
    }

    public boolean hasAnyStaff() {
        return staffRepository.count() > 0;
    }

    @Transactional
    public Staff register(StaffCreateRequest request) {
        if (request == null || request.role() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "role is required");
        }
        Staff staff = newStaffForRole(request.role());
        if (staff instanceof Doctor doctor) {
            String npi = request.npiNumber() == null ? "" : request.npiNumber().trim();
            String specialty = request.specialty() == null ? "" : request.specialty().trim();
            if (npi.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "npiNumber is required for doctors");
            }
            if (!npi.matches("\\d{10}")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "npiNumber must be exactly 10 digits");
            }
            if (specialty.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "specialty is required for doctors");
            }
            if (doctorRepository.existsByNpiNumber(npi)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "NPI already registered");
            }
            doctor.setNpiNumber(npi);
            doctor.setSpecialty(specialty);
        } else if ((request.npiNumber() != null && !request.npiNumber().isBlank())
                || (request.specialty() != null && !request.specialty().isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "npiNumber and specialty are only used when role is DOCTOR");
        }

        staff.setFirstName(requireText(request.firstName(), "firstName"));
        staff.setLastName(requireText(request.lastName(), "lastName"));
        staff.setEmail(blankToNull(request.email()));
        staff.setPhone(blankToNull(request.phone()));
        staff.setRole(request.role());
        staff.setUsername(request.username());
        staff.setPasswordHash(request.passwordHash());
        return persistNewStaff(staff);
    }

    @Transactional
    public Staff save(Staff staff) {
        normalizeCredentials(staff);
        if (staff.getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Creating staff is done via POST with a registration payload");
        }
        if (staff.getRole() == StaffRole.DOCTOR && !(staff instanceof Doctor)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Doctor accounts cannot be updated as a generic staff record");
        }
        return persistStaffUpdate(staff);
    }

    private static Staff newStaffForRole(StaffRole role) {
        return switch (role) {
            case DOCTOR -> new Doctor();
            case RECEPTION -> new ReceptionStaff();
            case NURSE -> new NurseStaff();
            case BILLING -> new BillingStaff();
            case ADMIN -> new ClinicAdmin();
            case OTHER -> new OtherStaff();
        };
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " is required");
        }
        return value.trim();
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void normalizeCredentials(Staff staff) {
        if (staff.getUsername() != null) {
            staff.setUsername(staff.getUsername().trim().toLowerCase());
        }

    }

    private Staff persistNewStaff(Staff staff) {
        if (staff.getUsername() == null || staff.getUsername().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username is required");
        }
        if (staffRepository.existsByUsernameIgnoreCase(staff.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "username already in use");
        }
        String password = staff.getPasswordHash();
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required");
        }
        if (!isAlreadyBcryptEncoded(password) && password.length() < MIN_PASSWORD_LENGTH) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "password must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }
        staff.setPasswordHash(encodePasswordIfPlain(password));
        staff.setLastLoginAt(null);
        return saveNewStaffByRole(staff);
    }

    /**
     * Persists the base {@code staff} row and the JOINED subclass row (e.g. {@code doctors},
     * {@code nurse_staff}) via the concrete repository for that role.
     */
    private Staff saveNewStaffByRole(Staff staff) {
        return switch (staff.getRole()) {
            case DOCTOR -> doctorRepository.save((Doctor) staff);
            case NURSE -> nurseStaffRepository.save((NurseStaff) staff);
            case RECEPTION -> receptionStaffRepository.save((ReceptionStaff) staff);
            case BILLING -> billingStaffRepository.save((BillingStaff) staff);
            case ADMIN -> clinicAdminRepository.save((ClinicAdmin) staff);
            case OTHER -> otherStaffRepository.save((OtherStaff) staff);
        };
    }

    private Staff persistStaffUpdate(Staff staff) {
        Staff existing = staffRepository.findById(staff.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found"));
        if (staff.getUsername() == null || staff.getUsername().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username is required");
        }

        if (staffRepository.existsByUsernameIgnoreCaseAndIdNot(staff.getUsername(), staff.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "username already in use");
        }
 
        String incomingPassword = staff.getPasswordHash();
        if (incomingPassword == null || incomingPassword.isBlank()) {
            staff.setPasswordHash(existing.getPasswordHash());
        } else if (isAlreadyBcryptEncoded(incomingPassword)) {
            staff.setPasswordHash(incomingPassword);
        } else {
            if (incomingPassword.length() < MIN_PASSWORD_LENGTH) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "password must be at least " + MIN_PASSWORD_LENGTH + " characters");
            }
            staff.setPasswordHash(passwordEncoder.encode(incomingPassword));
        }
        staff.setLastLoginAt(existing.getLastLoginAt());
        return staffRepository.save(staff);
    }

    private String encodePasswordIfPlain(String password) {
        if (isAlreadyBcryptEncoded(password)) {
            return password;
        }
        return passwordEncoder.encode(password);
    }

    private static boolean isAlreadyBcryptEncoded(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }

    @Transactional
    public StaffLoginResponse login(StaffLoginRequest request) {
        if (request.username() == null || request.username().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username is required");
        }
        if (request.password() == null || request.password().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required");
        }

        String username = request.username().trim().toLowerCase();
        Staff staff = staffRepository.findByUsername(username)
                .orElseThrow(StaffService::invalidCredentials);
        if (!staff.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account disabled");
        }
        if (!passwordEncoder.matches(request.password(), staff.getPasswordHash())) {
            throw invalidCredentials();
        }

        staff.setLastLoginAt(Instant.now());
        staffRepository.save(staff);
        return StaffLoginResponse.from(staff, authTokenService.issueToken(staff));
    }

    private static ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }

    @Transactional
    public void deleteById(Long id) {
        staffRepository.deleteById(id);
    }
}
