package com.talent.ai.core.model;

import jakarta.persistence.*;

@Entity
@Table(name = "prsn_info")
public class PersonInfo {

	@Id
	@Column(name = "user_id")
	private Long userId;

	private String firstName;
	private String skills;
	private String education;
	@Column(name = "description", length = 4000)
	private String description;
	private String resumeUrl;
	private String resumeName;

	@OneToOne
	@MapsId
	@JoinColumn(name = "user_id")
	private User user;

	// Getters and setters

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getSkills() {
		return skills;
	}

	public void setSkills(String skills) {
		this.skills = skills;
	}

	public String getEducation() {
		return education;
	}

	public void setEducation(String education) {
		this.education = education;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getResumeUrl() {
		return resumeUrl;
	}

	public void setResumeUrl(String resumeUrl) {
		this.resumeUrl = resumeUrl;
	}

	public String getResumeName() {
		return resumeName;
	}

	public void setResumeName(String resumeName) {
		this.resumeName = resumeName;
	}

}
