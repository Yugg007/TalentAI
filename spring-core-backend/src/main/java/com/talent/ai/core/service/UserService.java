package com.talent.ai.core.service;

import java.util.Locale;

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
        if (dto == null || isBlank(dto.getUsername()) || isBlank(dto.getEmail()) || isBlank(dto.getPassword())) {
	        throw new Exception("Invalid user data.");
	    }

        String username = dto.getUsername().trim();
        String email = dto.getEmail().trim().toLowerCase(Locale.ROOT);
        String role = normalizeRole(dto.getRole());

	    // Check if user already exists
        if (userRepository.findByUsername(username).isPresent()) {
            throw new Exception("User already exists with username: " + username);
	    }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new Exception("User already exists with email: " + email);
	    }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(role);
        userRepository.save(user);

        PersonInfo personInfo = new PersonInfo();
        personInfo.setFirstName(dto.getFirstName() == null ? null : dto.getFirstName().trim());
        personInfo.setDescription(dto.getDescription());

        // Set bidirectional relationship
        personInfo.setUser(user);
        user.setPersonInfos(personInfo);
        userRepository.save(user);
        masterDataLoader.loadConfiguration();
	    return UserDTO.fromEntity(user);
	}
	
	public UserDTO login(AuthUserDto dto) throws Exception {
        if (dto == null || isBlank(dto.getEmail()) || isBlank(dto.getPassword())) {
            throw new Exception("Email and password are required.");
        }
        User dbUser = masterData.loadUserViaUserEmail(dto.getEmail().trim());
		if(dbUser == null) {
			throw new Exception("User not found.");
		}
		
		if (!passwordEncoder.matches(dto.getPassword(), dbUser.getPassword())) {
			throw new Exception("Invalid credentials.");
		}
		
		return UserDTO.fromEntity(dbUser);
	}

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalizeRole(String role) throws Exception {
        String normalizedRole = isBlank(role) ? "candidate" : role.trim().toLowerCase(Locale.ROOT);
        if (!"candidate".equals(normalizedRole) && !"recruiter".equals(normalizedRole)) {
            throw new Exception("Account type must be candidate or recruiter.");
        }
        return normalizedRole;
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
        if (userDTO.getCompanyName() != null) {
            personInfo.setCompanyName(userDTO.getCompanyName());
        }
        if (userDTO.getJobTitle() != null) {
            personInfo.setJobTitle(userDTO.getJobTitle());
        }
        if (userDTO.getHiringFocus() != null) {
            personInfo.setHiringFocus(userDTO.getHiringFocus());
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