package com.zoovet.api.repository;

import com.zoovet.api.model.VaccineRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccineRecordRepository extends JpaRepository<VaccineRecord, Long> {
    List<VaccineRecord> findByPetIdOrderByApplicationDateDesc(Long petId);
    List<VaccineRecord> findAllByOrderByApplicationDateDesc();
}
