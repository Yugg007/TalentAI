package com.talent.ai.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talent.ai.model.JobPosting;
import com.talent.ai.service.JobPostingService;

@RestController
@RequestMapping("/job")
@CrossOrigin(origins = "*")
public class JobPostingController {

    @Autowired
    private JobPostingService jobPostingService;

    @PostMapping("/createJob")
    public JobPosting createJob(@RequestBody JobPosting jobPosting) {
    	JobPosting jb =  jobPostingService.saveJob(jobPosting);
    	return jb;
    }

    @PostMapping("/fetchAllJobs")
    public List<JobPosting> getAllJobs() {
    	List<JobPosting> jp = jobPostingService.getAllJobs();
        return jp;
    }

    @PostMapping("/fetchJobById")
    public JobPosting getJobById(@RequestBody JobPosting jobPosting) {
        return jobPostingService.getJobById(jobPosting.getId()).orElse(null);
    }

    @DeleteMapping("/delete-job/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobPostingService.deleteJob(id);
    }
}
