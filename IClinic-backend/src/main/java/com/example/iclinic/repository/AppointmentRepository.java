package com.example.iclinic.repository;

import com.example.iclinic.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByScheduledStartGreaterThanEqualAndScheduledStartBefore(
            LocalDateTime startInclusive,
            LocalDateTime endExclusive);

    List<Appointment> findByActiveTrueAndScheduledStartGreaterThanEqualAndScheduledStartBefore(
            LocalDateTime startInclusive,
            LocalDateTime endExclusive);
}
