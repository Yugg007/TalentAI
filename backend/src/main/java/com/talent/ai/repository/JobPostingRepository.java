package com.talent.ai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.talent.ai.model.JobPosting;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
}