package com.zoovet.api.service;

import com.zoovet.api.dto.VaccineRecordDto;
import com.zoovet.api.model.Pet;
import com.zoovet.api.model.Role;
import com.zoovet.api.model.User;
import com.zoovet.api.model.VaccineRecord;
import com.zoovet.api.repository.PetRepository;
import com.zoovet.api.repository.VaccineRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VaccineRecordService {

    private final VaccineRecordRepository vaccineRecordRepository;
    private final PetRepository petRepository;

    public List<VaccineRecordDto> getVaccines(Long petId, User currentUser) {
        if (petId != null) {
            Pet pet = petRepository.findById(petId)
                    .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + petId));

            if (currentUser.getRole() == Role.ROLE_CLIENTE && !pet.getOwner().getId().equals(currentUser.getId())) {
                throw new SecurityException("No tienes permiso para ver las vacunas de esta mascota");
            }

            return vaccineRecordRepository.findByPetIdOrderByApplicationDateDesc(petId).stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        if (currentUser.getRole() == Role.ROLE_CLIENTE) {
            List<Pet> clientPets = petRepository.findByOwnerId(currentUser.getId());
            return clientPets.stream()
                    .flatMap(pet -> vaccineRecordRepository.findByPetIdOrderByApplicationDateDesc(pet.getId()).stream())
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        return vaccineRecordRepository.findAllByOrderByApplicationDateDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VaccineRecordDto createVaccine(VaccineRecordDto dto, User currentUser) {
        if (currentUser.getRole() == Role.ROLE_CLIENTE) {
            throw new SecurityException("Solo el personal veterinario o administradores pueden registrar vacunas");
        }

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + dto.getPetId()));

        VaccineRecord vaccine = VaccineRecord.builder()
                .pet(pet)
                .vaccineName(dto.getVaccineName())
                .applicationDate(dto.getApplicationDate())
                .nextDueDate(dto.getNextDueDate())
                .veterinarian(currentUser)
                .batchNumber(dto.getBatchNumber())
                .notes(dto.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        return mapToDto(vaccineRecordRepository.save(vaccine));
    }

    @Transactional
    public void deleteVaccine(Long id) {
        vaccineRecordRepository.deleteById(id);
    }

    public VaccineRecordDto mapToDto(VaccineRecord vaccine) {
        return VaccineRecordDto.builder()
                .id(vaccine.getId())
                .petId(vaccine.getPet().getId())
                .petName(vaccine.getPet().getName())
                .petSpecies(vaccine.getPet().getSpecies())
                .ownerName(vaccine.getPet().getOwner().getFullName())
                .vaccineName(vaccine.getVaccineName())
                .applicationDate(vaccine.getApplicationDate())
                .nextDueDate(vaccine.getNextDueDate())
                .veterinarianId(vaccine.getVeterinarian() != null ? vaccine.getVeterinarian().getId() : null)
                .veterinarianName(vaccine.getVeterinarian() != null ? vaccine.getVeterinarian().getFullName() : null)
                .batchNumber(vaccine.getBatchNumber())
                .notes(vaccine.getNotes())
                .build();
    }
}
