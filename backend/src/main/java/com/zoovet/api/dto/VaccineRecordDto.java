package com.zoovet.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccineRecordDto {
    private Long id;

    @NotNull(message = "El id de la mascota es obligatorio")
    private Long petId;
    private String petName;
    private String petSpecies;
    private String ownerName;

    @NotBlank(message = "El nombre de la vacuna es obligatorio")
    private String vaccineName;

    @NotNull(message = "La fecha de aplicación es obligatoria")
    private LocalDate applicationDate;

    private LocalDate nextDueDate;

    private Long veterinarianId;
    private String veterinarianName;

    private String batchNumber;
    private String notes;
}
