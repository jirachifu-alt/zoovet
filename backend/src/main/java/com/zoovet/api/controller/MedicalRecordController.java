package com.zoovet.api.controller;

import com.zoovet.api.dto.MedicalRecordDto;
import com.zoovet.api.model.User;
import com.zoovet.api.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping
    public ResponseEntity<List<MedicalRecordDto>> getRecords(
            @RequestParam(required = false) Long petId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(medicalRecordService.getRecords(petId, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecordDto> getRecordById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(medicalRecordService.getRecordById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<?> createRecord(
            @Valid @RequestBody MedicalRecordDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            MedicalRecordDto created = medicalRecordService.createRecord(dto, currentUser);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable Long id) {
        try {
            medicalRecordService.deleteRecord(id);
            return ResponseEntity.ok(Map.of("message", "Historial eliminado"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
