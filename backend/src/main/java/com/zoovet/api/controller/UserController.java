package com.zoovet.api.controller;

import com.zoovet.api.dto.UserDto;
import com.zoovet.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/veterinarians")
    public ResponseEntity<List<UserDto>> getVeterinarians() {
        return ResponseEntity.ok(userService.getVeterinarians());
    }

    @GetMapping("/clients")
    public ResponseEntity<List<UserDto>> getClients() {
        return ResponseEntity.ok(userService.getClients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
