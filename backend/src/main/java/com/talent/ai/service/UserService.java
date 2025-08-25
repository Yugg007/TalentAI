package com.talent.ai.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.talent.ai.config.MasterDataLoader;
import com.talent.ai.dto.AuthUserDto;
import com.talent.ai.dto.UserDTO;
import com.talent.ai.model.MasterData;
import com.talent.ai.model.PersonInfo;
import com.talent.ai.model.User;
import com.talent.ai.repository.UserRepository;

@Service
public class UserService {
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private MasterData masterData;
	@Autowired
	private MasterDataLoader masterDataLoader;

	public UserDTO register(AuthUserDto dto) throws Exception {
	    if (dto == null || dto.getUsername() == null || dto.getUsername().trim().isEmpty()) {
	        throw new Exception("Invalid user data.");
	    }

	    // Check if user already exists
	    User existingUser = masterData.loadUserViaUserName(dto.getUsername());
	    if (existingUser != null) {
	        throw new Exception("User already exists with username: " + dto.getUsername());
	    }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword()); // Hash it in real apps
        userRepository.save(user);

        PersonInfo personInfo = new PersonInfo();
        personInfo.setFirstName(dto.getFirstName());
        personInfo.setDescription(dto.getDescription());

        // Set bidirectional relationship
        personInfo.setUser(user);
        user.setPersonInfos(personInfo);
        userRepository.save(user);
        masterDataLoader.loadConfiguration();
	    return UserDTO.fromEntity(user);
	}
	
	public UserDTO login(AuthUserDto dto) throws Exception {
		User dbUser = masterData.loadUserViaUserEmail(dto.getEmail());
		if(dbUser == null) {
			throw new Exception("User not found.");
		}
		
		if(!dbUser.getPassword().equals(dto.getPassword())) {
			throw new Exception("Password mismatch.");
		}
		
		return UserDTO.fromEntity(dbUser);
	}

    public UserDTO updateUserProfile(UserDTO userDTO) throws Exception {
        User user = masterData.loadUserViaUserName(userDTO.getUsername());
        if (user == null) {
            throw new Exception("User not found.");
        }

        // Update or create PersonInfo
        PersonInfo personInfo = user.getPersonInfos();
        if (personInfo == null) {
            personInfo = new PersonInfo();
            personInfo.setUser(user);
        }

        if(userDTO.getFirstName() != null) {
        	personInfo.setFirstName(userDTO.getFirstName());        	
        }
        if(userDTO.getSkills() != null) {
        	personInfo.setSkills(userDTO.getSkills());
        }
        if(userDTO.getDescription() != null) {
        	personInfo.setDescription(userDTO.getDescription());
        }
        if(userDTO.getEducation() != null) {
        	personInfo.setEducation(userDTO.getEducation());
        }
        user.setPersonInfos(personInfo);

        // Save both User and PersonInfo (cascade will help here)
        userRepository.save(user);
        
        return UserDTO.fromEntity(user);
    }
	

}