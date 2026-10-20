package com.zoovet.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 50)
    private String species; // Perro, Gato, Ave, Conejo, etc.

    @Column(length = 80)
    private String breed;

    @Column(length = 15)
    private String gender; // Macho, Hembra

    private LocalDate birthDate;

    private Double weightKg;

    @Column(length = 50)
    private String color;

    @Column(length = 500)
    private String photoUrl;

    @Column(length = 1000)
    private String notes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
