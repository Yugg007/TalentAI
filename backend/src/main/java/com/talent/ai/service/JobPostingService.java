package com.talent.ai.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talent.ai.model.JobPosting;
import com.talent.ai.repository.JobPostingRepository;

@Service
public class JobPostingService {

    @Autowired
    private JobPostingRepository jobPostingRepository;

    public JobPosting saveJob(JobPosting jobPosting) {
    	JobPosting jp =  jobPostingRepository.save(jobPosting);
    	return jp;
    }

    public List<JobPosting> getAllJobs() {
        return jobPostingRepository.findAll();
    }

    public Optional<JobPosting> getJobById(Long id) {
    	Optional<JobPosting> jp = jobPostingRepository.findById(id);
    	return jp;
    }

    public void deleteJob(Long id) {
        jobPostingRepository.deleteById(id);
    }
}
