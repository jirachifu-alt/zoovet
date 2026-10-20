package com.zoovet.api.controller;

import com.zoovet.api.dto.VaccineRecordDto;
import com.zoovet.api.model.User;
import com.zoovet.api.service.VaccineRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vaccines")
@RequiredArgsConstructor
public class VaccineRecordController {

    private final VaccineRecordService vaccineRecordService;

    @GetMapping
    public ResponseEntity<List<VaccineRecordDto>> getVaccines(
            @RequestParam(required = false) Long petId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(vaccineRecordService.getVaccines(petId, currentUser));
    }

    @PostMapping
    public ResponseEntity<?> createVaccine(
            @Valid @RequestBody VaccineRecordDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            VaccineRecordDto created = vaccineRecordService.createVaccine(dto, currentUser);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVaccine(@PathVariable Long id) {
        try {
            vaccineRecordService.deleteVaccine(id);
            return ResponseEntity.ok(Map.of("message", "Vacuna eliminada"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
