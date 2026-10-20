package com.zoovet.api.service;

import com.zoovet.api.dto.AppointmentDto;
import com.zoovet.api.model.*;
import com.zoovet.api.repository.AppointmentRepository;
import com.zoovet.api.repository.PetRepository;
import com.zoovet.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    public List<AppointmentDto> getAppointments(User currentUser) {
        if (currentUser.getRole() == Role.ROLE_CLIENTE) {
            return appointmentRepository.findByClientIdOrderByDateTimeDesc(currentUser.getId()).stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole() == Role.ROLE_VETERINARIO) {
            // Veterinarians can see their own appointments or all clinic appointments
            return appointmentRepository.findAllByOrderByDateTimeDesc().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        return appointmentRepository.findAllByOrderByDateTimeDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AppointmentDto getAppointmentById(Long id, User currentUser) {
        Appointment app = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + id));

        if (currentUser.getRole() == Role.ROLE_CLIENTE && !app.getClient().getId().equals(currentUser.getId())) {
            throw new SecurityException("No tienes permiso para ver esta cita");
        }

        return mapToDto(app);
    }

    @Transactional
    public AppointmentDto createAppointment(AppointmentDto dto, User currentUser) {
        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + dto.getPetId()));

        User client;
        if (currentUser != null && currentUser.getRole() == Role.ROLE_CLIENTE) {
            client = currentUser;
            if (pet.getOwner() != null && !pet.getOwner().getId().equals(currentUser.getId())) {
                throw new SecurityException("Solo puedes agendar citas para tus propias mascotas");
            }
        } else {
            Long clientId = dto.getClientId() != null ? dto.getClientId() : (pet.getOwner() != null ? pet.getOwner().getId() : null);
            if (clientId != null) {
                client = userRepository.findById(clientId).orElse(currentUser);
            } else {
                client = (pet.getOwner() != null) ? pet.getOwner() : currentUser;
            }
        }
        if (client == null) {
            throw new IllegalArgumentException("No se pudo determinar el cliente para la cita.");
        }

        User vet = null;
        if (dto.getVeterinarianId() != null) {
            vet = userRepository.findById(dto.getVeterinarianId()).orElse(null);
        }

        Appointment appointment = Appointment.builder()
                .pet(pet)
                .client(client)
                .veterinarian(vet)
                .dateTime(dto.getDateTime())
                .reason(dto.getReason())
                .notes(dto.getNotes())
                .status(dto.getStatus() != null ? dto.getStatus() : AppointmentStatus.PENDIENTE)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto updateStatus(Long id, AppointmentStatus status, User currentUser) {
        Appointment app = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + id));

        if (currentUser.getRole() == Role.ROLE_CLIENTE) {
            if (!app.getClient().getId().equals(currentUser.getId())) {
                throw new SecurityException("No puedes modificar citas de otro usuario");
            }
            if (status != AppointmentStatus.CANCELADA) {
                throw new IllegalArgumentException("Los clientes solo pueden cancelar sus citas");
            }
        }

        app.setStatus(status);
        return mapToDto(appointmentRepository.save(app));
    }

    @Transactional
    public AppointmentDto assignVeterinarian(Long id, Long veterinarianId) {
        Appointment app = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + id));

        User vet = userRepository.findById(veterinarianId)
                .orElseThrow(() -> new IllegalArgumentException("Veterinario no encontrado con ID: " + veterinarianId));

        app.setVeterinarian(vet);
        if (app.getStatus() == AppointmentStatus.PENDIENTE) {
            app.setStatus(AppointmentStatus.CONFIRMADA);
        }

        return mapToDto(appointmentRepository.save(app));
    }

    @Transactional
    public void deleteAppointment(Long id, User currentUser) {
        Appointment app = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + id));

        if (currentUser.getRole() == Role.ROLE_CLIENTE && !app.getClient().getId().equals(currentUser.getId())) {
            throw new SecurityException("No tienes permiso para eliminar esta cita");
        }

        appointmentRepository.delete(app);
    }

    public AppointmentDto mapToDto(Appointment app) {
        return AppointmentDto.builder()
                .id(app.getId())
                .petId(app.getPet().getId())
                .petName(app.getPet().getName())
                .petSpecies(app.getPet().getSpecies())
                .clientId(app.getClient().getId())
                .clientName(app.getClient().getFullName())
                .clientPhone(app.getClient().getPhone())
                .veterinarianId(app.getVeterinarian() != null ? app.getVeterinarian().getId() : null)
                .veterinarianName(app.getVeterinarian() != null ? app.getVeterinarian().getFullName() : "Por asignar")
                .dateTime(app.getDateTime())
                .reason(app.getReason())
                .notes(app.getNotes())
                .status(app.getStatus())
                .build();
    }
}
