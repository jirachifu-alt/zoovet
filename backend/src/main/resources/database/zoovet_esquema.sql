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
-- Table structure for table `medical_records`
--

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
-- Table structure for table `pets`
--

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
-- Table structure for table `users`
--

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
-- Table structure for table `vaccine_records`
--

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-06  1:30:27
