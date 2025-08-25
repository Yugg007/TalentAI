package com.talent.ai.utils;

import java.util.ArrayList;
import java.util.List;

import com.talent.ai.dto.PendingConnectionDto;
import com.talent.ai.dto.UserDTO;
import com.talent.ai.model.User;

public class GenericUtils {
	
	public static List<UserDTO> getListOfUserDto(List<User> users){
		List<UserDTO> dtos = new ArrayList<>();
		for(User user : users) {
			dtos.add(UserDTO.fromEntity(user));
		}
		return dtos;
	}
	
	public static PendingConnectionDto getPendingConnectionDto(UserDTO user, String message){
		 PendingConnectionDto dto = new PendingConnectionDto();
		 dto.setMessage(message);
		 dto.setUserId(user.getUserId());
		 dto.setUsername(user.getUsername());
		 dto.setFirstName(user.getFirstName());
		 return dto;
	}

}
