package com.talent.ai.dto;

import java.util.ArrayList;
import java.util.List;

public class ConnectionPageDTO {
	private List<UserDTO> myConnections = new ArrayList<>();
	private List<PendingConnectionDto> pendingConnections = new ArrayList<>();
	private List<UserDTO> people = new ArrayList<>();
	private List<UserDTO> inviteSend = new ArrayList<>();
	
	public List<UserDTO> getMyConnections() {
		return myConnections;
	}
	public void setMyConnections(List<UserDTO> myConnections) {
		this.myConnections = myConnections;
	}
	public List<PendingConnectionDto> getPendingConnections() {
		return pendingConnections;
	}
	public void setPendingConnections(List<PendingConnectionDto> pendingConnections) {
		this.pendingConnections = pendingConnections;
	}
	public List<UserDTO> getPeople() {
		return people;
	}
	public void setPeople(List<UserDTO> people) {
		this.people = people;
	}
	public List<UserDTO> getInviteSend() {
		return inviteSend;
	}
	public void setInviteSend(List<UserDTO> inviteSend) {
		this.inviteSend = inviteSend;
	}

}
