package com.zoovet.api.service;

import com.zoovet.api.dto.PetDto;
import com.zoovet.api.model.Pet;
import com.zoovet.api.model.Role;
import com.zoovet.api.model.User;
import com.zoovet.api.repository.PetRepository;
import com.zoovet.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PetService {

    public static final List<String> LIVESTOCK_SPECIES = List.of(
            "Vaca", "Toro", "Oveja", "Cabra", "Cerdo", "Caballo",
            "Burro", "Mula", "Llama", "Alpaca", "Búfalo"
    );

    private static final Set<String> LIVESTOCK_SPECIES_NORMALIZED = LIVESTOCK_SPECIES.stream()
            .map(value -> value.toLowerCase(Locale.ROOT))
            .collect(Collectors.toSet());

    private final PetRepository petRepository;
    private final UserRepository userRepository;

    public List<PetDto> getPets(User currentUser, Long ownerId, String search, Boolean livestockOnly) {
        List<Pet> pets;

        if (currentUser.getRole() == Role.ROLE_CLIENTE) {
            pets = petRepository.findByOwnerId(currentUser.getId());
        } else if (ownerId != null) {
            pets = petRepository.findByOwnerId(ownerId);
        } else if (search != null && !search.isBlank()) {
            pets = petRepository.findByNameContainingIgnoreCase(search.trim());
        } else {
            pets = petRepository.findAll();
        }

        return pets.stream()
                .filter(pet -> !Boolean.TRUE.equals(livestockOnly) || isLivestock(pet))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public boolean isLivestock(Pet pet) {
        return pet.getSpecies() != null
                && LIVESTOCK_SPECIES_NORMALIZED.contains(pet.getSpecies().trim().toLowerCase(Locale.ROOT));
    }

    public PetDto getPetById(Long id, User currentUser) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + id));

        if (currentUser.getRole() == Role.ROLE_CLIENTE && !pet.getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("No tienes permiso para ver esta mascota");
        }

        return mapToDto(pet);
    }

    @Transactional
    public PetDto createPet(PetDto dto, User currentUser) {
        Long targetOwnerId;
        if (currentUser.getRole() == Role.ROLE_CLIENTE) {
            targetOwnerId = currentUser.getId();
        } else {
            targetOwnerId = dto.getOwnerId() != null ? dto.getOwnerId() : currentUser.getId();
        }

        User owner = userRepository.findById(targetOwnerId)
                .orElseThrow(() -> new IllegalArgumentException("Propietario no encontrado con ID: " + targetOwnerId));

        Pet pet = Pet.builder()
                .name(dto.getName())
                .species(dto.getSpecies())
                .breed(dto.getBreed())
                .productionType(dto.getProductionType())
                .farmName(dto.getFarmName())
                .recordCode(dto.getRecordCode())
                .gender(dto.getGender())
                .birthDate(dto.getBirthDate())
                .weightKg(dto.getWeightKg())
                .color(dto.getColor())
                .photoUrl(dto.getPhotoUrl())
                .notes(dto.getNotes())
                .owner(owner)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToDto(petRepository.save(pet));
    }

    @Transactional
    public PetDto updatePet(Long id, PetDto dto, User currentUser) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + id));

        if (currentUser.getRole() == Role.ROLE_CLIENTE && !pet.getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("No tienes permiso para modificar esta mascota");
        }

        pet.setName(dto.getName());
        pet.setSpecies(dto.getSpecies());
        pet.setBreed(dto.getBreed());
        pet.setProductionType(dto.getProductionType());
        pet.setFarmName(dto.getFarmName());
        pet.setRecordCode(dto.getRecordCode());
        pet.setGender(dto.getGender());
        pet.setBirthDate(dto.getBirthDate());
        pet.setWeightKg(dto.getWeightKg());
        pet.setColor(dto.getColor());
        pet.setPhotoUrl(dto.getPhotoUrl());
        pet.setNotes(dto.getNotes());

        if (currentUser.getRole() != Role.ROLE_CLIENTE && dto.getOwnerId() != null) {
            User newOwner = userRepository.findById(dto.getOwnerId())
                    .orElseThrow(() -> new IllegalArgumentException("Propietario no encontrado con ID: " + dto.getOwnerId()));
            pet.setOwner(newOwner);
        }

        return mapToDto(petRepository.save(pet));
    }

    @Transactional
    public void deletePet(Long id, User currentUser) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + id));

        if (currentUser.getRole() == Role.ROLE_CLIENTE && !pet.getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("No tienes permiso para eliminar esta mascota");
        }

        petRepository.delete(pet);
    }

    public PetDto mapToDto(Pet pet) {
        return PetDto.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .productionType(pet.getProductionType())
                .farmName(pet.getFarmName())
                .recordCode(pet.getRecordCode())
                .gender(pet.getGender())
                .birthDate(pet.getBirthDate())
                .weightKg(pet.getWeightKg())
                .color(pet.getColor())
                .photoUrl(pet.getPhotoUrl())
                .notes(pet.getNotes())
                .ownerId(pet.getOwner().getId())
                .ownerName(pet.getOwner().getFullName())
                .ownerPhone(pet.getOwner().getPhone())
                .ownerEmail(pet.getOwner().getEmail())
                .build();
    }
}
