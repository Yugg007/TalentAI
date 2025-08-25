package com.talent.ai.dto;

public class UserConnectionDto {
	private String username;
	private String targetUsername;
	private String message;
	
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getTargetUsername() {
		return targetUsername;
	}
	public void setTargetUsername(String targetUsername) {
		this.targetUsername = targetUsername;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
}
