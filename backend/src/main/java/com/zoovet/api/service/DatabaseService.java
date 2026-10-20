package com.zoovet.api.service;

import com.zoovet.api.dto.DatabaseOperationResponse;
import com.zoovet.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DatabaseService {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccineRecordRepository vaccineRecordRepository;

    public DatabaseOperationResponse injectSqlScript() {
        String scriptName = "zoovet_completo_con_datos.sql";
        log.info("Iniciando inyección de script SQL: {}", scriptName);

        Resource resource = findResource(scriptName);
        if (resource == null || !resource.exists()) {
            throw new RuntimeException("No se encontró el script SQL " + scriptName + " ni en classpath ni en la carpeta database.");
        }

        try {
            // Desactivar temporalmente revisión de llaves foráneas para evitar conflictos en DROP/INSERT
            try {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0;");
            } catch (Exception e) {
                log.warn("No se pudo ejecutar SET FOREIGN_KEY_CHECKS = 0: {}", e.getMessage());
            }

            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(resource);
            populator.setSqlScriptEncoding(StandardCharsets.UTF_8.name());
            populator.setContinueOnError(true);
            populator.setIgnoreFailedDrops(true);
            populator.setSeparator(";");
            populator.execute(dataSource);

            // Reactivar revisión de llaves foráneas
            try {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1;");
            } catch (Exception e) {
                log.warn("No se pudo ejecutar SET FOREIGN_KEY_CHECKS = 1: {}", e.getMessage());
            }

            log.info("Inyección de script SQL completada con éxito.");

            return DatabaseOperationResponse.builder()
                    .success(true)
                    .message("Script SQL '" + scriptName + "' inyectado y ejecutado con éxito en MySQL.")
                    .scriptName(scriptName)
                    .timestamp(LocalDateTime.now())
                    .totalUsers(userRepository.count())
                    .totalPets(petRepository.count())
                    .totalAppointments(appointmentRepository.count())
                    .totalMedicalRecords(medicalRecordRepository.count())
                    .totalVaccines(vaccineRecordRepository.count())
                    .build();

        } catch (Exception e) {
            log.error("Error al inyectar script SQL en MySQL: {}", e.getMessage(), e);
            throw new RuntimeException("Error al inyectar script SQL: " + e.getMessage(), e);
        }
    }

    public DatabaseOperationResponse getStatus() {
        return DatabaseOperationResponse.builder()
                .success(true)
                .message("Estado actual de la base de datos MySQL zoovet_db.")
                .scriptName("zoovet_completo_con_datos.sql")
                .timestamp(LocalDateTime.now())
                .totalUsers(userRepository.count())
                .totalPets(petRepository.count())
                .totalAppointments(appointmentRepository.count())
                .totalMedicalRecords(medicalRecordRepository.count())
                .totalVaccines(vaccineRecordRepository.count())
                .build();
    }

    private Resource findResource(String scriptName) {
        // 1. Intentar en classpath:database/
        Resource res = new ClassPathResource("database/" + scriptName);
        if (res.exists()) return res;

        // 2. Intentar en classpath:/
        res = new ClassPathResource(scriptName);
        if (res.exists()) return res;

        // 3. Intentar en filesystem ./database/
        File f1 = new File("database/" + scriptName);
        if (f1.exists()) return new FileSystemResource(f1);

        // 4. Intentar en filesystem ../database/
        File f2 = new File("../database/" + scriptName);
        if (f2.exists()) return new FileSystemResource(f2);

        // 5. Intentar en backend/database/
        File f3 = new File("backend/database/" + scriptName);
        if (f3.exists()) return new FileSystemResource(f3);

        return null;
    }
}
