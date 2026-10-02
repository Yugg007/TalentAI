package com.talent.ai.core.dto;

public class ATSTaskResponse {
	private String taskId;
	private String content;
	private String message;
	private String status;

	public ATSTaskResponse(String taskId, String content, String message, String status) {
		super();
		this.taskId = taskId;
		this.content = content;
		this.message = message;
		this.status = status;
	}

	public ATSTaskResponse() {
		// TODO Auto-generated constructor stub
	}

	public String getTaskId() {
		return taskId;
	}

	public void setTaskId(String taskId) {
		this.taskId = taskId;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
	
	

}
