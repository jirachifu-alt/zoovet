-- =============================================================
--  ZooVet / VetCare Pro - Base de datos MySQL
--  MySQL Server 8.0  |  Servidor: localhost:3306  |  Usuario: root
--  IMPORTAR EN MYSQL WORKBENCH: archivo > Open SQL Script
-- =============================================================
CREATE DATABASE IF NOT EXISTS zoovet_db
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zoovet_db;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: zoovet_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `date_time` datetime(6) NOT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `reason` varchar(200) NOT NULL,
  `status` enum('CANCELADA','COMPLETADA','CONFIRMADA','EN_ATENCION','PENDIENTE') NOT NULL,
  `client_id` bigint NOT NULL,
  `pet_id` bigint NOT NULL,
  `veterinarian_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKgdcpcx3yc2abu5oyb2078lc24` (`client_id`),
  KEY `FK62dl3dvwsbveq3vv067becwmj` (`pet_id`),
  KEY `FKb39bnfnq2xyw1ykb9ojf85l3t` (`veterinarian_id`),
  CONSTRAINT `FK62dl3dvwsbveq3vv067becwmj` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`),
  CONSTRAINT `FKb39bnfnq2xyw1ykb9ojf85l3t` FOREIGN KEY (`veterinarian_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgdcpcx3yc2abu5oyb2078lc24` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,'2026-10-06 06:27:52.315424','2026-10-07 15:00:52.315424','Paciente estable','Control rutinario y desparasitación trimestral','CONFIRMADA',4,1,2),(2,'2026-10-06 06:27:52.323715','2026-10-08 20:30:52.323715','Traer carnet de vacunación','Vacunación refuerzo Triple Felina','PENDIENTE',4,2,3),(3,'2026-10-06 06:27:52.329056','2026-10-06 21:00:52.329056','Se rasca con frecuencia la zona de las patas','Revisión de pliegues dérmicos e irritación','EN_ATENCION',5,3,2),(4,'2026-10-01 06:27:52.335604','2026-10-01 16:00:52.335604','Completada con éxito. Se recetó colirio oftálmico.','Revisión ocular por lagrimeo','COMPLETADA',4,4,3);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `date` datetime(6) NOT NULL,
  `diagnosis` text,
  `notes` text,
  `prescription` text,
  `reason` varchar(250) NOT NULL,
  `recorded_weight_kg` double DEFAULT NULL,
  `treatment` text,
  `pet_id` bigint NOT NULL,
  `veterinarian_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKojfodeedei8la4yhl5wfo99iy` (`pet_id`),
  KEY `FK1fuvqs23gb4agt6u659tywqqq` (`veterinarian_id`),
  CONSTRAINT `FK1fuvqs23gb4agt6u659tywqqq` FOREIGN KEY (`veterinarian_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKojfodeedei8la4yhl5wfo99iy` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_records`
--

LOCK TABLES `medical_records` WRITE;
/*!40000 ALTER TABLE `medical_records` DISABLE KEYS */;
INSERT INTO `medical_records` VALUES (1,'2026-09-06 06:27:52.343498','2026-09-06 06:27:52.343498','Infección bacteriana superficial por humedad en pabellón auditivo.','Evolución favorable en control posterior.','Gotas Otoclean: 3 gotas cada 12 horas por 7 días.','Otitis externa leve oído derecho',28,'Limpieza profunda con solución antiséptica y gotas óticas.',1,2),(2,'2026-10-01 06:27:52.352230','2026-10-01 06:27:52.352230','Conjuntivitis alérgica estacional.','Paciente recuperado al 100%.','Tobrex colirio: 1 gota en cada ojo cada 8 horas por 5 días.','Lagrimeo y conjuntivitis leve',3.8,'Lavado con suero fisiológico y aplicación de ungüento oftálmico.',4,3);
/*!40000 ALTER TABLE `medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pets`
--

DROP TABLE IF EXISTS `pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `birth_date` date DEFAULT NULL,
  `breed` varchar(80) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `gender` varchar(15) DEFAULT NULL,
  `name` varchar(80) NOT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `species` varchar(50) NOT NULL,
  `weight_kg` double DEFAULT NULL,
  `owner_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKoygstexeo9ivoylgrdrv2tc39` (`owner_id`),
  CONSTRAINT `FKoygstexeo9ivoylgrdrv2tc39` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pets`
--

LOCK TABLES `pets` WRITE;
/*!40000 ALTER TABLE `pets` DISABLE KEYS */;
INSERT INTO `pets` VALUES (1,'2023-10-06','Golden Retriever','Dorado','2026-10-06 06:27:52.283389','Macho','Max','Perro muy dócil y activo. Alérgico a pulgas.','https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80','Perro',28.5,4),(2,'2024-10-06','Siamés','Crema y chocolate','2026-10-06 06:27:52.295389','Hembra','Luna','Gatita tranquila. Vacunas al día.','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80','Gato',4.2,4),(3,'2025-08-06','Bulldog Francés','Atigrado','2026-10-06 06:27:52.301389','Macho','Rocky','Sensible al calor. Requiere limpieza de pliegues faciales.','https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80','Perro',12,5),(4,'2025-12-06','Persa','Naranja suave','2026-10-06 06:27:52.308388','Macho','Simba','Pelaje abundante, cepillado diario.','https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80','Gato',3.8,4);
/*!40000 ALTER TABLE `pets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `address` varchar(200) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(120) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('ROLE_ADMIN','ROLE_CLIENTE','ROLE_VETERINARIO') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,_binary '','Av. Principal 123, Miraflores','2026-10-06 06:27:51.891119','admin@zoovet.com','Dr. Administrador General','$2a$10$K8TmAclGy55wQ6zuUhNKQ.ORxuKy72jXPIZY1c55K3uN072r6vOiW','+51 987 654 321','ROLE_ADMIN'),(2,_binary '','Calle Los Robles 456, San Isidro','2026-10-06 06:27:52.026867','vet@zoovet.com','Dr. Carlos Mendoza','$2a$10$KNORlF59lXATpDrfBFTOYOZVbicRlLu.S4w2tzqss/41zEgbgQA5q','+51 991 234 567','ROLE_VETERINARIO'),(3,_binary '','Av. Del Sol 789, Surco','2026-10-06 06:27:52.104143','dra.laura@zoovet.com','Dra. Laura Sánchez','$2a$10$zY4egXZd5zkET1I2gx83c.t/mRRjBAwYyPdoH86oy3FOU5CX4bR/C','+51 992 345 678','ROLE_VETERINARIO'),(4,_binary '','Jr. Las Flores 321, Barranco','2026-10-06 06:27:52.184554','cliente@zoovet.com','Ana Morales','$2a$10$sK9VOaT7vB8pBJKaGz1a2eSACQpwRXWZlHu8Qypkqd/UREpTMqKdy','+51 977 888 999','ROLE_CLIENTE'),(5,_binary '','Av. Arequipa 1020, Lince','2026-10-06 06:27:52.267302','roberto@zoovet.com','Roberto Gómez','$2a$10$fVFZcWpLJEGBH3tMutIAS.kvblm5XCYICci/6EU.p0wxtj/r4i0Z.','+51 966 555 444','ROLE_CLIENTE');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccine_records`
--

DROP TABLE IF EXISTS `vaccine_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaccine_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `application_date` date NOT NULL,
  `batch_number` varchar(60) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `next_due_date` date DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `vaccine_name` varchar(100) NOT NULL,
  `pet_id` bigint NOT NULL,
  `veterinarian_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqyossvttfotoxt960810jfrqq` (`pet_id`),
  KEY `FKbuww5540vi0jc3g6ydfu9k6cm` (`veterinarian_id`),
  CONSTRAINT `FKbuww5540vi0jc3g6ydfu9k6cm` FOREIGN KEY (`veterinarian_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqyossvttfotoxt960810jfrqq` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccine_records`
--

LOCK TABLES `vaccine_records` WRITE;
/*!40000 ALTER TABLE `vaccine_records` DISABLE KEYS */;
INSERT INTO `vaccine_records` VALUES (1,'2026-04-06','VAC-2026-X88','2026-04-06 06:27:52.360961','2027-04-06','Sin reacciones adversas','Séxtuple Canina (DHPPi+L)',1,2),(2,'2026-07-06','RAB-992-PER','2026-07-06 06:27:52.366950','2027-07-06','Certificado oficial emitido','Antirrábica',1,2),(3,'2025-11-06','FEL-771-A','2025-11-06 06:27:52.372972','2026-10-21','Próximo refuerzo pendiente en 15 días','Triple Felina (FVRCP)',2,3);
/*!40000 ALTER TABLE `vaccine_records` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-06  1:30:27
