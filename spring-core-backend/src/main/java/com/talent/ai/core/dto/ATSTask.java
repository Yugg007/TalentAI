package com.talent.ai.core.dto;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.Id;
import lombok.Data;

@Document(collection = "ats_task")
@Data
public class ATSTask {
	@Id
	private String id;
	private String username;

	private String requestHash;

	private String resumeText;
	private String jobDescription;

	// Status for your Scheduler: PENDING, PROCESSING, COMPLETED
	private String status;
	private String content; // The AI's final response
	private LocalDateTime createdAt = LocalDateTime.now();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getRequestHash() {
		return requestHash;
	}

	public void setRequestHash(String requestHash) {
		this.requestHash = requestHash;
	}

	public String getResumeText() {
		return resumeText;
	}

	public void setResumeText(String resumeText) {
		this.resumeText = resumeText;
	}

	public String getJobDescription() {
		return jobDescription;
	}

	public void setJobDescription(String jobDescription) {
		this.jobDescription = jobDescription;
	}


	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public ATSTask(String username, String resumeText, String jobDescription, String requestHash,
			String status) {
		super();
		this.username = username;
		this.requestHash = requestHash;
		this.resumeText = resumeText;
		this.jobDescription = jobDescription;
		this.status = status;
		this.createdAt = LocalDateTime.now();
	}

	public ATSTask() {
		super();
		// TODO Auto-generated constructor stub
	}

}