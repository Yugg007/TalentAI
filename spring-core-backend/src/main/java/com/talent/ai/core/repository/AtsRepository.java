package com.talent.ai.core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.talent.ai.core.dto.ATSTask;

@Repository
public interface AtsRepository extends MongoRepository<ATSTask, String> {

    Optional<ATSTask> findByUsernameAndRequestHash(
            String username,
            String requestHash);

    // This is what your Python Scheduler will look for (Status = PENDING)
    List<ATSTask> findByStatus(String status);
    Optional<ATSTask> findById(String id);
}