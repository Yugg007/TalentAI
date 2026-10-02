package com.talent.ai.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.talent.ai.core.model.JobPosting;


@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
}