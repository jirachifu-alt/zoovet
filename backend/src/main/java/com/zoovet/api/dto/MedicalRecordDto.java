package com.zoovet.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDto {
    private Long id;

    @NotNull(message = "El id de la mascota es obligatorio")
    private Long petId;
    private String petName;
    private String petSpecies;
    private String ownerName;

    private Long veterinarianId;
    private String veterinarianName;

    private LocalDateTime date;

    @NotBlank(message = "El motivo de la consulta es obligatorio")
    private String reason;

    private String diagnosis;
    private String treatment;
    private String prescription;
    private Double recordedWeightKg;
    private String notes;
}
