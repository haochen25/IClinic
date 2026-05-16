package com.example.iclinic.repository;

import com.example.iclinic.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUsername(String username);

    boolean existsByNpiNumber(String npiNumber);
}
