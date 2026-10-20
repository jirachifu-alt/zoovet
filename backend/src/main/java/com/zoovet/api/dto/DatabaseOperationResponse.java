package com.zoovet.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseOperationResponse {
    private boolean success;
    private String message;
    private String scriptName;
    private LocalDateTime timestamp;
    private long totalUsers;
    private long totalPets;
    private long totalAppointments;
    private long totalMedicalRecords;
    private long totalVaccines;
}
