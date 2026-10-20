package com.zoovet.api.controller;

import com.zoovet.api.dto.AppointmentDto;
import com.zoovet.api.model.AppointmentStatus;
import com.zoovet.api.model.User;
import com.zoovet.api.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<AppointmentDto>> getAppointments(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(appointmentService.getAppointments(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> getAppointmentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(
            @Valid @RequestBody AppointmentDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            AppointmentDto created = appointmentService.createAppointment(dto, currentUser);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            String statusStr = payload.get("status");
            AppointmentStatus status = AppointmentStatus.valueOf(statusStr.toUpperCase());
            AppointmentDto updated = appointmentService.updateStatus(id, status, currentUser);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/assign-vet")
    public ResponseEntity<?> assignVet(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload
    ) {
        try {
            Long vetId = payload.get("veterinarianId");
            AppointmentDto updated = appointmentService.assignVeterinarian(id, vetId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            appointmentService.deleteAppointment(id, currentUser);
            return ResponseEntity.ok(Map.of("message", "Cita eliminada"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
