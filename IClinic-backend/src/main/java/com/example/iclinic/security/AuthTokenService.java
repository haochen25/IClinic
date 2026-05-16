package com.example.iclinic.security;

import com.example.iclinic.model.Staff;
import com.example.iclinic.repository.StaffRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthTokenService {

    private static final Duration TOKEN_TTL = Duration.ofHours(12);

    private final StaffRepository staffRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, TokenRecord> tokens = new ConcurrentHashMap<>();

    public AuthTokenService(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    public String issueToken(Staff staff) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokens.put(token, new TokenRecord(staff.getId(), Instant.now().plus(TOKEN_TTL)));
        return token;
    }

    public Optional<Staff> findStaffByToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        TokenRecord record = tokens.get(token);
        if (record == null) {
            return Optional.empty();
        }
        if (record.expiresAt().isBefore(Instant.now())) {
            tokens.remove(token);
            return Optional.empty();
        }
        return staffRepository.findById(record.staffId()).filter(Staff::isActive);
    }

    private record TokenRecord(Long staffId, Instant expiresAt) {
    }
}
