package com.zoovet.api.service;

import com.zoovet.api.dto.MedicalRecordDto;
import com.zoovet.api.model.MedicalRecord;
import com.zoovet.api.model.Pet;
import com.zoovet.api.model.Role;
import com.zoovet.api.model.User;
import com.zoovet.api.repository.MedicalRecordRepository;
import com.zoovet.api.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PetRepository petRepository;

    public List<MedicalRecordDto> getRecords(Long petId, User currentUser) {
        if (petId != null) {
            Pet pet = petRepository.findById(petId)
                    .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + petId));

            if (currentUser.getRole() == Role.ROLE_CLIENTE && !pet.getOwner().getId().equals(currentUser.getId())) {
                throw new SecurityException("No tienes permiso para ver el historial clínico de esta mascota");
            }

            return medicalRecordRepository.findByPetIdOrderByDateDesc(petId).stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        if (currentUser.getRole() == Role.ROLE_CLIENTE) {
            // Get all records for client's pets
            List<Pet> clientPets = petRepository.findByOwnerId(currentUser.getId());
            return clientPets.stream()
                    .flatMap(pet -> medicalRecordRepository.findByPetIdOrderByDateDesc(pet.getId()).stream())
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        return medicalRecordRepository.findAllByOrderByDateDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MedicalRecordDto getRecordById(Long id, User currentUser) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Historial no encontrado con ID: " + id));

        if (currentUser.getRole() == Role.ROLE_CLIENTE && !record.getPet().getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("No tienes permiso para ver este registro médico");
        }

        return mapToDto(record);
    }

    @Transactional
    public MedicalRecordDto createRecord(MedicalRecordDto dto, User currentUser) {
        if (currentUser.getRole() == Role.ROLE_CLIENTE) {
            throw new SecurityException("Solo el personal veterinario o administradores pueden registrar consultas médicas");
        }

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + dto.getPetId()));

        MedicalRecord record = MedicalRecord.builder()
                .pet(pet)
                .veterinarian(currentUser)
                .date(dto.getDate() != null ? dto.getDate() : LocalDateTime.now())
                .reason(dto.getReason())
                .diagnosis(dto.getDiagnosis())
                .treatment(dto.getTreatment())
                .prescription(dto.getPrescription())
                .recordedWeightKg(dto.getRecordedWeightKg())
                .notes(dto.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        // Also update pet weight if recorded
        if (dto.getRecordedWeightKg() != null && dto.getRecordedWeightKg() > 0) {
            pet.setWeightKg(dto.getRecordedWeightKg());
            petRepository.save(pet);
        }

        return mapToDto(medicalRecordRepository.save(record));
    }

    @Transactional
    public void deleteRecord(Long id) {
        medicalRecordRepository.deleteById(id);
    }

    public MedicalRecordDto mapToDto(MedicalRecord record) {
        return MedicalRecordDto.builder()
                .id(record.getId())
                .petId(record.getPet().getId())
                .petName(record.getPet().getName())
                .petSpecies(record.getPet().getSpecies())
                .ownerName(record.getPet().getOwner().getFullName())
                .veterinarianId(record.getVeterinarian().getId())
                .veterinarianName(record.getVeterinarian().getFullName())
                .date(record.getDate())
                .reason(record.getReason())
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .prescription(record.getPrescription())
                .recordedWeightKg(record.getRecordedWeightKg())
                .notes(record.getNotes())
                .build();
    }
}
