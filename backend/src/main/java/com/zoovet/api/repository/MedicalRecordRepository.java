package com.zoovet.api.repository;

import com.zoovet.api.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPetIdOrderByDateDesc(Long petId);
    List<MedicalRecord> findAllByOrderByDateDesc();
    List<MedicalRecord> findByVeterinarianIdOrderByDateDesc(Long veterinarianId);
}
