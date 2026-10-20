package com.zoovet.api.repository;

import com.zoovet.api.model.Appointment;
import com.zoovet.api.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByClientIdOrderByDateTimeDesc(Long clientId);
    List<Appointment> findByVeterinarianIdOrderByDateTimeDesc(Long veterinarianId);
    List<Appointment> findAllByOrderByDateTimeDesc();
    List<Appointment> findByDateTimeBetweenOrderByDateTimeAsc(LocalDateTime start, LocalDateTime end);
    long countByStatus(AppointmentStatus status);
}
