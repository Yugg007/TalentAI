package com.talent.ai.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.talent.ai.core.config.MasterDataLoader;
import com.talent.ai.core.dto.AuthUserDto;
import com.talent.ai.core.dto.UserDTO;
import com.talent.ai.core.model.MasterData;
import com.talent.ai.core.model.PersonInfo;
import com.talent.ai.core.model.User;
import com.talent.ai.core.repository.UserRepository;



@Service
public class UserService {
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private MasterData masterData;
	@Autowired
	private MasterDataLoader masterDataLoader;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired
	private FileStorageService fileStorageService;

	public UserDTO register(AuthUserDto dto) throws Exception {
	    if (dto == null || dto.getUsername() == null || dto.getUsername().trim().isEmpty()) {
	        throw new Exception("Invalid user data.");
	    }

	    // Check if user already exists
	    if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
	        throw new Exception("User already exists with username: " + dto.getUsername());
	    }
	    if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
	        throw new Exception("User already exists with email: " + dto.getEmail());
	    }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
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
		
		if (!passwordEncoder.matches(dto.getPassword(), dbUser.getPassword())) {
			throw new Exception("Invalid credentials.");
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
        
        if (userDTO.getResume() != null && !userDTO.getResume().isEmpty()) {
            String savedPath = fileStorageService.saveResume(userDTO.getResume());
            personInfo.setResumeUrl(savedPath);
            personInfo.setResumeName(userDTO.getResume().getOriginalFilename());
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