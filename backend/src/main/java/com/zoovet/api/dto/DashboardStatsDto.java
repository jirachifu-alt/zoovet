package com.zoovet.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalPets;
    private long totalClients;
    private long totalVeterinarians;
    private long totalAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long totalMedicalRecords;
    private long totalVaccines;

    private List<AppointmentDto> upcomingAppointments;
    private List<PetDto> recentPets;
}
