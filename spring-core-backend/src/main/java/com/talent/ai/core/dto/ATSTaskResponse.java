package com.talent.ai.core.dto;

import java.util.Map;

public class ATSTaskResponse {
	private String taskId;
	private String content;
	private String message;
	private String status;
	private Map<String, Object> result;
	private String error;

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

	public Map<String, Object> getResult() {
		return result;
	}

	public void setResult(Map<String, Object> result) {
		this.result = result;
	}

	public String getError() {
		return error;
	}

	public void setError(String error) {
		this.error = error;
	}
	
	

}
