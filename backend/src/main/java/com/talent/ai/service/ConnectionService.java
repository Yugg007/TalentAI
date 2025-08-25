package com.talent.ai.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talent.ai.dto.ConnectionPageDTO;
import com.talent.ai.dto.PendingConnectionDto;
import com.talent.ai.dto.UserConnectionDto;
import com.talent.ai.dto.UserDTO;
import com.talent.ai.model.InviteStatus;
import com.talent.ai.model.MasterData;
import com.talent.ai.model.User;
import com.talent.ai.model.UserConnection;
import com.talent.ai.repository.InvitationStatusRepository;
import com.talent.ai.repository.UserConnectionRepository;
import com.talent.ai.utils.GenericUtils;

@Service
public class ConnectionService {
	@Autowired
	private UserConnectionRepository userConnectionRepository;
	@Autowired
	private MasterData masterData;
	@Autowired
	private InvitationStatusRepository invitationStatusRepository;

	public ConnectionPageDTO fetchConnectionDto(String username) {
	    ConnectionPageDTO dto = new ConnectionPageDTO();
	    
	    List<UserConnection> userConnection = userConnectionRepository.findAll();
	    
	    List<PendingConnectionDto> pendingConnDto = new ArrayList<>();
	    List<UserDTO> inviteSendDto = new ArrayList<>();
	    List<UserDTO> myConnDto = new ArrayList<>();
	    List<String> connUserNameList = new ArrayList<>();
	    connUserNameList.add(username);
	    
	    for(UserConnection uc : userConnection) {
	    	if(uc.getUser1().getUsername().equals(username) || uc.getUser2().getUsername().equals(username)) {
	    		User conn = uc.getUser1().getUsername().equals(username) ? uc.getUser2() : uc.getUser1();
	    		Boolean isSecondUserAConn = uc.getUser1().getUsername().equals(username) ? true : false;
	    		connUserNameList.add(conn.getUsername());
	    		
	    		if(uc.getStatus().equals("CONNECTED")) {
	    			myConnDto.add(UserDTO.fromEntity(conn));
	    		}
	    		else {
	    			if(isSecondUserAConn) {
	    				inviteSendDto.add(UserDTO.fromEntity(conn));
	    			}
	    			else {
	    				pendingConnDto.add(GenericUtils.getPendingConnectionDto(UserDTO.fromEntity(conn), uc.getMessage()));
	    			}
	    		}
	    		
	    	}
	    }
	    
	    dto.setMyConnections(myConnDto);
	    dto.setInviteSend(inviteSendDto);
	    dto.setPendingConnections(pendingConnDto);
	    
	    
	    List<UserDTO> dt = getAllPeople(connUserNameList);
	    dto.setPeople(dt);
//	    List<PendingConnectionDto> pDto = new ArrayList<>();
//	    for(UserDTO ur : dt) {
//	    	pDto.add(GenericUtils.getPendingConnectionDto(ur, ur.getUsername()));
//	    }
//	    dto.setPendingConnections(pDto);
//	    dto.setInviteSend(dt);
	    return dto;
	}
	
	public void sendConnectionRequest(UserConnectionDto dto) {
		User connectionUser = masterData.loadUserViaUserName(dto.getTargetUsername());
		User user = masterData.loadUserViaUserName(dto.getUsername());
		
        if (userConnectionRepository.existsByUser1UserIdAndUser2UserId(user.getUserId(), connectionUser.getUserId()) || userConnectionRepository.existsByUser1UserIdAndUser2UserId(connectionUser.getUserId(), user.getUserId())) {
            throw new RuntimeException("Connection already exists between users.");
        }


        UserConnection connection = new UserConnection();
        connection.setUser1(user);
        connection.setUser2(connectionUser);
        connection.setMessage(dto.getMessage());
        connection.setStatus("PENDING");
        userConnectionRepository.save(connection);
	}	
	
	private List<UserDTO> getAllPeople(List<String> userNames) {
	    return GenericUtils.getListOfUserDto(
	        masterData.getAllUser().stream()
	            .filter(user -> !userNames.contains(user.getUsername()))
	            .collect(Collectors.toList())
	    );
	}

	public void acceptPendingRequest(UserConnectionDto dto) {
		List<UserConnection> ucList = userConnectionRepository.findByUser1_UsernameAndUser2_Username(dto.getUsername(), dto.getTargetUsername());
		if(ucList.size() == 0) {
			ucList = userConnectionRepository.findByUser1_UsernameAndUser2_Username(dto.getTargetUsername(), dto.getUsername());
		}
		
		if(ucList.size() > 0) {
			for(UserConnection uc : ucList) {
				uc.setStatus("CONNECTED");
				userConnectionRepository.save(uc);
			}
		}
		
	}
	
	

}
