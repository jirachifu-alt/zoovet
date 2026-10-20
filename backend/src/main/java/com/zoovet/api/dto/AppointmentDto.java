package com.zoovet.api.dto;

import com.zoovet.api.model.AppointmentStatus;
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
public class AppointmentDto {
    private Long id;

    @NotNull(message = "El id de la mascota es obligatorio")
    private Long petId;
    private String petName;
    private String petSpecies;

    private Long clientId;
    private String clientName;
    private String clientPhone;

    private Long veterinarianId;
    private String veterinarianName;

    @NotNull(message = "La fecha y hora de la cita son obligatorias")
    private LocalDateTime dateTime;

    @NotNull(message = "El motivo de la cita es obligatorio")
    private String reason;

    private String notes;
    private AppointmentStatus status;
}
