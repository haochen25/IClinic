package com.example.iclinic.dto;

import com.example.iclinic.model.Doctor;
import com.example.iclinic.model.Staff;
import com.example.iclinic.model.StaffRole;

public record StaffLoginResponse(
        Long id,
        String username,
        StaffRole role,
        String firstName,
        String lastName,
        String email,
        boolean active,
        String specialty,
        String token
) {
    public static StaffLoginResponse from(Staff staff, String token) {
        if (staff instanceof Doctor doctor) {
            return new StaffLoginResponse(
                    staff.getId(),
                    staff.getUsername(),
                    staff.getRole(),
                    staff.getFirstName(),
                    staff.getLastName(),
                    staff.getEmail(),
                    staff.isActive(),
                    doctor.getSpecialty(),
                    token);
        }
        return new StaffLoginResponse(
                staff.getId(),
                staff.getUsername(),
                staff.getRole(),
                staff.getFirstName(),
                staff.getLastName(),
                staff.getEmail(),
                staff.isActive(),
                null,
                token);
    }
}
