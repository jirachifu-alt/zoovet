package com.zoovet.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetDto {
    private Long id;

    @NotBlank(message = "El nombre de la mascota es obligatorio")
    private String name;

    @NotBlank(message = "La especie es obligatoria")
    private String species;

    private String breed;
    private String gender;
    private LocalDate birthDate;
    private Double weightKg;
    private String color;
    private String photoUrl;
    private String notes;

    private Long ownerId;
    private String ownerName;
    private String ownerPhone;
    private String ownerEmail;
}
