package com.zoovet.api.seed;

import com.zoovet.api.model.*;
import com.zoovet.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccineRecordRepository vaccineRecordRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        ensureSchemaSupportsZootechnicians();

        if (userRepository.count() == 0) {
            seedBaseData();
        }

        ensureZootechnicianData();
    }

    /**
     * Mantiene compatibles las bases de datos creadas antes del módulo de zootecnia.
     * Hibernate crea las columnas nuevas, pero MySQL no siempre amplía un ENUM existente.
     */
    private void ensureSchemaSupportsZootechnicians() {
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE users MODIFY COLUMN role " +
                    "ENUM('ROLE_ADMIN','ROLE_CLIENTE','ROLE_VETERINARIO','ROLE_ZOOTECNICO') NOT NULL"
            );
        } catch (Exception e) {
            System.out.println(">>> Aviso: no se pudo ampliar el ENUM de roles: " + e.getMessage());
        }

        ensureColumn("pets", "production_type", "production_type VARCHAR(50) NULL");
        ensureColumn("pets", "farm_name", "farm_name VARCHAR(120) NULL");
        ensureColumn("pets", "record_code", "record_code VARCHAR(60) NULL");
    }

    private void ensureColumn(String table, String column, String definition) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.columns " +
                    "WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
                    Integer.class,
                    table,
                    column
            );

            if (count == null || count == 0) {
                jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN " + definition);
            }
        } catch (Exception e) {
            System.out.println(">>> Aviso: no se pudo verificar/crear " + table + "." + column + ": " + e.getMessage());
        }
    }

    private void seedBaseData() {
        System.out.println(">>> Inicializando datos iniciales de ZooVet / VetCare Pro...");

        // 1. Usuarios
        User admin = userRepository.save(User.builder()
                .email("admin@zoovet.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Dr. Administrador General")
                .phone("+51 987 654 321")
                .address("Av. Principal 123, Miraflores")
                .role(Role.ROLE_ADMIN)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        User vet1 = userRepository.save(User.builder()
                .email("vet@zoovet.com")
                .password(passwordEncoder.encode("vet123"))
                .fullName("Dr. Carlos Mendoza")
                .phone("+51 991 234 567")
                .address("Calle Los Robles 456, San Isidro")
                .role(Role.ROLE_VETERINARIO)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        User vet2 = userRepository.save(User.builder()
                .email("dra.laura@zoovet.com")
                .password(passwordEncoder.encode("vet123"))
                .fullName("Dra. Laura Sánchez")
                .phone("+51 992 345 678")
                .address("Av. Del Sol 789, Surco")
                .role(Role.ROLE_VETERINARIO)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        User client1 = userRepository.save(User.builder()
                .email("cliente@zoovet.com")
                .password(passwordEncoder.encode("cliente123"))
                .fullName("Ana Morales")
                .phone("+51 977 888 999")
                .address("Jr. Las Flores 321, Barranco")
                .role(Role.ROLE_CLIENTE)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        User client2 = userRepository.save(User.builder()
                .email("roberto@zoovet.com")
                .password(passwordEncoder.encode("cliente123"))
                .fullName("Roberto Gómez")
                .phone("+51 966 555 444")
                .address("Av. Arequipa 1020, Lince")
                .role(Role.ROLE_CLIENTE)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        // 2. Mascotas
        Pet max = petRepository.save(Pet.builder()
                .name("Max")
                .species("Perro")
                .breed("Golden Retriever")
                .gender("Macho")
                .birthDate(LocalDate.now().minusYears(3))
                .weightKg(28.5)
                .color("Dorado")
                .photoUrl("https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80")
                .notes("Perro muy dócil y activo. Alérgico a pulgas.")
                .owner(client1)
                .createdAt(LocalDateTime.now())
                .build());

        Pet luna = petRepository.save(Pet.builder()
                .name("Luna")
                .species("Gato")
                .breed("Siamés")
                .gender("Hembra")
                .birthDate(LocalDate.now().minusYears(2))
                .weightKg(4.2)
                .color("Crema y chocolate")
                .photoUrl("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80")
                .notes("Gatita tranquila. Vacunas al día.")
                .owner(client1)
                .createdAt(LocalDateTime.now())
                .build());

        Pet rocky = petRepository.save(Pet.builder()
                .name("Rocky")
                .species("Perro")
                .breed("Bulldog Francés")
                .gender("Macho")
                .birthDate(LocalDate.now().minusYears(1).minusMonths(2))
                .weightKg(12.0)
                .color("Atigrado")
                .photoUrl("https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80")
                .notes("Sensible al calor. Requiere limpieza de pliegues faciales.")
                .owner(client2)
                .createdAt(LocalDateTime.now())
                .build());

        Pet simba = petRepository.save(Pet.builder()
                .name("Simba")
                .species("Gato")
                .breed("Persa")
                .gender("Macho")
                .birthDate(LocalDate.now().minusMonths(10))
                .weightKg(3.8)
                .color("Naranja suave")
                .photoUrl("https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80")
                .notes("Pelaje abundante, cepillado diario.")
                .owner(client1)
                .createdAt(LocalDateTime.now())
                .build());

        // 3. Citas
        appointmentRepository.save(Appointment.builder()
                .pet(max)
                .client(client1)
                .veterinarian(vet1)
                .dateTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                .reason("Control rutinario y desparasitación trimestral")
                .notes("Paciente estable")
                .status(AppointmentStatus.CONFIRMADA)
                .createdAt(LocalDateTime.now())
                .build());

        appointmentRepository.save(Appointment.builder()
                .pet(luna)
                .client(client1)
                .veterinarian(vet2)
                .dateTime(LocalDateTime.now().plusDays(2).withHour(15).withMinute(30))
                .reason("Vacunación refuerzo Triple Felina")
                .notes("Traer carnet de vacunación")
                .status(AppointmentStatus.PENDIENTE)
                .createdAt(LocalDateTime.now())
                .build());

        appointmentRepository.save(Appointment.builder()
                .pet(rocky)
                .client(client2)
                .veterinarian(vet1)
                .dateTime(LocalDateTime.now().withHour(16).withMinute(0))
                .reason("Revisión de pliegues dérmicos e irritación")
                .notes("Se rasca con frecuencia la zona de las patas")
                .status(AppointmentStatus.EN_ATENCION)
                .createdAt(LocalDateTime.now())
                .build());

        appointmentRepository.save(Appointment.builder()
                .pet(simba)
                .client(client1)
                .veterinarian(vet2)
                .dateTime(LocalDateTime.now().minusDays(5).withHour(11).withMinute(0))
                .reason("Revisión ocular por lagrimeo")
                .notes("Completada con éxito. Se recetó colirio oftálmico.")
                .status(AppointmentStatus.COMPLETADA)
                .createdAt(LocalDateTime.now().minusDays(5))
                .build());

        // 4. Historiales Médicos
        medicalRecordRepository.save(MedicalRecord.builder()
                .pet(max)
                .veterinarian(vet1)
                .date(LocalDateTime.now().minusMonths(1))
                .reason("Otitis externa leve oído derecho")
                .diagnosis("Infección bacteriana superficial por humedad en pabellón auditivo.")
                .treatment("Limpieza profunda con solución antiséptica y gotas óticas.")
                .prescription("Gotas Otoclean: 3 gotas cada 12 horas por 7 días.")
                .recordedWeightKg(28.0)
                .notes("Evolución favorable en control posterior.")
                .createdAt(LocalDateTime.now().minusMonths(1))
                .build());

        medicalRecordRepository.save(MedicalRecord.builder()
                .pet(simba)
                .veterinarian(vet2)
                .date(LocalDateTime.now().minusDays(5))
                .reason("Lagrimeo y conjuntivitis leve")
                .diagnosis("Conjuntivitis alérgica estacional.")
                .treatment("Lavado con suero fisiológico y aplicación de ungüento oftálmico.")
                .prescription("Tobrex colirio: 1 gota en cada ojo cada 8 horas por 5 días.")
                .recordedWeightKg(3.8)
                .notes("Paciente recuperado al 100%.")
                .createdAt(LocalDateTime.now().minusDays(5))
                .build());

        // 5. Vacunas
        vaccineRecordRepository.save(VaccineRecord.builder()
                .pet(max)
                .vaccineName("Séxtuple Canina (DHPPi+L)")
                .applicationDate(LocalDate.now().minusMonths(6))
                .nextDueDate(LocalDate.now().plusMonths(6))
                .veterinarian(vet1)
                .batchNumber("VAC-2026-X88")
                .notes("Sin reacciones adversas")
                .createdAt(LocalDateTime.now().minusMonths(6))
                .build());

        vaccineRecordRepository.save(VaccineRecord.builder()
                .pet(max)
                .vaccineName("Antirrábica")
                .applicationDate(LocalDate.now().minusMonths(3))
                .nextDueDate(LocalDate.now().plusMonths(9))
                .veterinarian(vet1)
                .batchNumber("RAB-992-PER")
                .notes("Certificado oficial emitido")
                .createdAt(LocalDateTime.now().minusMonths(3))
                .build());

        vaccineRecordRepository.save(VaccineRecord.builder()
                .pet(luna)
                .vaccineName("Triple Felina (FVRCP)")
                .applicationDate(LocalDate.now().minusMonths(11))
                .nextDueDate(LocalDate.now().plusDays(15))
                .veterinarian(vet2)
                .batchNumber("FEL-771-A")
                .notes("Próximo refuerzo pendiente en 15 días")
                .createdAt(LocalDateTime.now().minusMonths(11))
                .build());

        System.out.println(">>> Base de datos ZooVet inicializada con éxito.");
    }

    private void ensureZootechnicianData() {
        ensureUser(
                "zootecnico@zoovet.com",
                "zootecnico123",
                "Ing. Marco Quispe",
                "+51 955 111 222",
                "Av. Los Andes 210, Ate",
                Role.ROLE_ZOOTECNICO
        );

        ensureUser(
                "zootecnica@zoovet.com",
                "zootecnico123",
                "Ing. Lucía Torres",
                "+51 955 333 444",
                "Calle Los Nogales 145, La Molina",
                Role.ROLE_ZOOTECNICO
        );

        User farm = ensureUser(
                "granja@zoovet.com",
                "granja123",
                "Granja Santa Rosa",
                "+51 944 333 444",
                "Km 18 Carretera Central, Huachipa",
                Role.ROLE_CLIENTE
        );

        ensureLivestockPet(
                "Mora", "Vaca", "Holstein", "Hembra", 520.0,
                "Blanco y negro", "Leche", "Granja Santa Rosa", "VAC-001",
                LocalDate.now().minusYears(4),
                "Vaca productora de leche. Control reproductivo y mastitis al día.",
                "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80",
                farm
        );

        ensureLivestockPet(
                "Canela", "Oveja", "Corriedale", "Hembra", 68.0,
                "Marrón claro", "Lana", "Granja Santa Rosa", "OVI-014",
                LocalDate.now().minusYears(2),
                "Oveja de doble propósito. Esquila programada para fin de temporada.",
                "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=400&q=80",
                farm
        );

        ensureLivestockPet(
                "Nube", "Cabra", "Saanen", "Hembra", 52.0,
                "Blanca", "Leche", "Granja Santa Rosa", "CAP-007",
                LocalDate.now().minusYears(3),
                "Cabra lechera. Requiere control de parasitosis y cascos.",
                "https://images.pexels.com/photos/34075170/pexels-photo-34075170.jpeg?auto=compress&w=400",
                farm
        );

        ensureLivestockPet(
                "Trufa", "Cerdo", "Landrace", "Macho", 130.0,
                "Rosado", "Carne", "Granja Santa Rosa", "POR-022",
                LocalDate.now().minusYears(1),
                "Cerdo de engorde. Control de peso y vacunación al día.",
                "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80",
                farm
        );

        ensureLivestockPet(
                "Relámpago", "Caballo", "Peruano de Paso", "Macho", 430.0,
                "Alazán", "Trabajo", "Granja Santa Rosa", "EQU-003",
                LocalDate.now().minusYears(5),
                "Caballo de trabajo y exhibición. Revisión podal mensual.",
                "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=400&q=80",
                farm
        );

        ensureLivestockPet(
                "Chaska", "Alpaca", "Huacaya", "Hembra", 62.0,
                "Beige", "Fibra", "Granja Santa Rosa", "ALP-009",
                LocalDate.now().minusYears(3),
                "Alpaca de producción de fibra. Esquila y control de ectoparásitos.",
                "https://images.pexels.com/photos/12164253/pexels-photo-12164253.jpeg?auto=compress&w=400",
                farm
        );

        System.out.println(">>> Módulo de zootecnia verificado: usuarios y animales de granja disponibles.");
    }

    private User ensureUser(
            String email,
            String rawPassword,
            String fullName,
            String phone,
            String address,
            Role role
    ) {
        return userRepository.findByEmail(email).orElseGet(() -> userRepository.save(
                User.builder()
                        .email(email)
                        .password(passwordEncoder.encode(rawPassword))
                        .fullName(fullName)
                        .phone(phone)
                        .address(address)
                        .role(role)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build()
        ));
    }

    private void ensureLivestockPet(
            String name,
            String species,
            String breed,
            String gender,
            Double weightKg,
            String color,
            String productionType,
            String farmName,
            String recordCode,
            LocalDate birthDate,
            String notes,
            String photoUrl,
            User owner
    ) {
        if (petRepository.existsByNameIgnoreCase(name)) {
            return;
        }

        petRepository.save(Pet.builder()
                .name(name)
                .species(species)
                .breed(breed)
                .productionType(productionType)
                .farmName(farmName)
                .recordCode(recordCode)
                .gender(gender)
                .birthDate(birthDate)
                .weightKg(weightKg)
                .color(color)
                .photoUrl(photoUrl)
                .notes(notes)
                .owner(owner)
                .createdAt(LocalDateTime.now())
                .build());
    }
}
