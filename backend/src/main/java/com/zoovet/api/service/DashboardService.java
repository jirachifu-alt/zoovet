package com.zoovet.api.service;

import com.zoovet.api.dto.AppointmentDto;
import com.zoovet.api.dto.DashboardStatsDto;
import com.zoovet.api.dto.PetDto;
import com.zoovet.api.model.AppointmentStatus;
import com.zoovet.api.model.Role;
import com.zoovet.api.model.User;
import com.zoovet.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccineRecordRepository vaccineRecordRepository;
    private final AppointmentService appointmentService;
    private final PetService petService;

    public DashboardStatsDto getStats(User currentUser) {
        if (currentUser.getRole() == Role.ROLE_CLIENTE) {
            // Client personalized stats
            List<PetDto> clientPets = petService.getPets(currentUser, null, null);
            List<AppointmentDto> clientAppointments = appointmentService.getAppointments(currentUser);

            long pending = clientAppointments.stream().filter(a -> a.getStatus() == AppointmentStatus.PENDIENTE).count();
            long confirmed = clientAppointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CONFIRMADA).count();
            long completed = clientAppointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETADA).count();

            return DashboardStatsDto.builder()
                    .totalPets(clientPets.size())
                    .totalClients(1)
                    .totalVeterinarians(userRepository.findByRoleAndActiveTrue(Role.ROLE_VETERINARIO).size())
                    .totalAppointments(clientAppointments.size())
                    .pendingAppointments(pending)
                    .confirmedAppointments(confirmed)
                    .completedAppointments(completed)
                    .totalMedicalRecords(medicalRecordRepository.findAll().stream()
                            .filter(m -> m.getPet().getOwner().getId().equals(currentUser.getId())).count())
                    .totalVaccines(vaccineRecordRepository.findAll().stream()
                            .filter(v -> v.getPet().getOwner().getId().equals(currentUser.getId())).count())
                    .upcomingAppointments(clientAppointments.stream().limit(5).collect(Collectors.toList()))
                    .recentPets(clientPets.stream().limit(5).collect(Collectors.toList()))
                    .build();
        }

        // Clinic Admin & Veterinarian stats
        long totalPets = petRepository.count();
        long totalClients = userRepository.findByRole(Role.ROLE_CLIENTE).size();
        long totalVets = userRepository.findByRole(Role.ROLE_VETERINARIO).size();
        long totalApps = appointmentRepository.count();
        long pending = appointmentRepository.countByStatus(AppointmentStatus.PENDIENTE);
        long confirmed = appointmentRepository.countByStatus(AppointmentStatus.CONFIRMADA);
        long completed = appointmentRepository.countByStatus(AppointmentStatus.COMPLETADA);
        long totalMedical = medicalRecordRepository.count();
        long totalVaccines = vaccineRecordRepository.count();

        List<AppointmentDto> upcoming = appointmentRepository.findAllByOrderByDateTimeDesc().stream()
                .limit(5)
                .map(appointmentService::mapToDto)
                .collect(Collectors.toList());

        List<PetDto> recent = petRepository.findAll().stream()
                .limit(5)
                .map(petService::mapToDto)
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalPets(totalPets)
                .totalClients(totalClients)
                .totalVeterinarians(totalVets)
                .totalAppointments(totalApps)
                .pendingAppointments(pending)
                .confirmedAppointments(confirmed)
                .completedAppointments(completed)
                .totalMedicalRecords(totalMedical)
                .totalVaccines(totalVaccines)
                .upcomingAppointments(upcoming)
                .recentPets(recent)
                .build();
    }
}
