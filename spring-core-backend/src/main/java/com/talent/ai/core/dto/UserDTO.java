package com.talent.ai.core.dto;

import org.springframework.web.multipart.MultipartFile;

import com.talent.ai.core.model.PersonInfo;
import com.talent.ai.core.model.User;

public class UserDTO {

    // From User
    private Long userId;
    private String username;
    private String email;
    private String role;

    // From PersonInfo
    private String firstName;
    private String companyName;
    private String jobTitle;
    private String hiringFocus;
    private String skills;
    private String education;
    private String description;
	private String resumeUrl;
	private String resumeName;
    private MultipartFile resume;

    // --- Getters and Setters ---

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getHiringFocus() {
        return hiringFocus;
    }

    public void setHiringFocus(String hiringFocus) {
        this.hiringFocus = hiringFocus;
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

	public MultipartFile getResume() {
		return resume;
	}

	public void setResume(MultipartFile resume) {
		this.resume = resume;
	}

	public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();

        if (user != null) {
            dto.setUserId(user.getUserId());
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole() == null ? "candidate" : user.getRole());

            PersonInfo info = user.getPersonInfos();
            if (info != null) {
                dto.setFirstName(info.getFirstName());
                dto.setCompanyName(info.getCompanyName());
                dto.setJobTitle(info.getJobTitle());
                dto.setHiringFocus(info.getHiringFocus());
                dto.setSkills(info.getSkills());
                dto.setEducation(info.getEducation());
                dto.setDescription(info.getDescription());
                dto.setResumeName(info.getResumeName());
                dto.setResumeUrl(info.getResumeUrl());
            }
        }

        return dto;
    }
}
