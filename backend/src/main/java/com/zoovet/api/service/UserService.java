package com.zoovet.api.service;

import com.zoovet.api.dto.UserDto;
import com.zoovet.api.model.Role;
import com.zoovet.api.model.User;
import com.zoovet.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<UserDto> getVeterinarians() {
        return userRepository.findByRoleAndActiveTrue(Role.ROLE_VETERINARIO).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<UserDto> getClients() {
        return userRepository.findByRoleAndActiveTrue(Role.ROLE_CLIENTE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        return mapToDto(user);
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .active(user.getActive())
                .build();
    }
}
