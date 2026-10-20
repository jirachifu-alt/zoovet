package com.zoovet.api.controller;

import com.zoovet.api.dto.PetDto;
import com.zoovet.api.model.User;
import com.zoovet.api.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @GetMapping
    public ResponseEntity<List<PetDto>> getPets(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(petService.getPets(currentUser, ownerId, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetDto> getPetById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(petService.getPetById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<?> createPet(
            @Valid @RequestBody PetDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            PetDto created = petService.createPet(dto, currentUser);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePet(
            @PathVariable Long id,
            @Valid @RequestBody PetDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            PetDto updated = petService.updatePet(id, dto, currentUser);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            petService.deletePet(id, currentUser);
            return ResponseEntity.ok(Map.of("message", "Mascota eliminada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
