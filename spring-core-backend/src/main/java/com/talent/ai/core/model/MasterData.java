package com.talent.ai.core.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class MasterData {
	private List<User> users = new ArrayList<>();
	private List<PersonInfo> personInfos = new ArrayList<>();
	private List<User> usersDTO = new ArrayList<>();
	
	public List<User> getAllUser(){
		return users;
	}
	
	public void loadUserIntoCache(List<User> users) {
		this.users = users;
	}
	
	public void loadPersonInfoIntoCache(List<PersonInfo> personInfos) {
		this.personInfos = new ArrayList<>(personInfos);
		this.usersDTO = new ArrayList<>(this.users);
		for(User dto : this.usersDTO) {
			PersonInfo pi = loadPersonInfoViaUserName(dto.getUsername());
			if(pi != null) {
				dto.setPersonInfos(pi);
			}
		}
	}	
	
	public User loadUserViaUserName(String username) {
		for(User user : users) {
			if(user.getUsername().equals(username)) {
				return user;
			}
		}
		return null;
	}
	
	public String fetchEmailViaUserName(String username) {
		for(User user : users) {
			if(user.getUsername().equals(username)) {
				return user.getEmail();
			}
		}
		return null;
	}	
	
	public User loadUserViaUserEmail(String email) {
		for(User user : users) {
			if(user.getEmail() != null && user.getEmail().equalsIgnoreCase(email.trim())) {
				return user;
			}
		}
		return null;
	}
	
	public PersonInfo loadPersonInfoViaUserName(String username) {
		for(PersonInfo personInfo : personInfos) {
			if (personInfo.getUser() != null && username.equals(personInfo.getUser().getUsername())) {
				return personInfo;
			}
		}
		return null;
	}

	public User loadUserViaUserId(Long uid) {
		for(User user : users) {
			if(user.getUserId() == uid) {
				return user;
			}
		}
		return null;
	}	
}
