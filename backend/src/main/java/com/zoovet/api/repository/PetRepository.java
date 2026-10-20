package com.zoovet.api.repository;

import com.zoovet.api.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerId(Long ownerId);
    List<Pet> findByNameContainingIgnoreCase(String name);
    long count();
}
