package com.example.iclinic.dto;

import com.example.iclinic.model.StaffRole;

/**
 * Payload for {@code POST /api/staff} (self-registration and staff creation).
 */
public record StaffCreateRequest(
        String firstName,
        String lastName,
        String email,
        String phone,
        StaffRole role,
        String username,
        String passwordHash,
        String npiNumber,
        String specialty) {
}
