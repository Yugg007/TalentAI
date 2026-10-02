package com.talent.ai.core.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talent.ai.core.dto.AuthUserDto;
import com.talent.ai.core.dto.UserDTO;
import com.talent.ai.core.model.MasterData;
import com.talent.ai.core.model.User;
import com.talent.ai.core.service.FileStorageService;
import com.talent.ai.core.service.UserService;
import com.talent.ai.core.utils.AesUtil;
import com.talent.ai.core.utils.CookieUtil;
import com.talent.ai.core.utils.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/user")
public class UserController {

    private final MasterData masterData;
	@Autowired
	private UserService userService;
	
	@Autowired
	private CookieUtil cookieUtil;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private FileStorageService fileStorageService;

    UserController(MasterData masterData) {
        this.masterData = masterData;
    }

	@GetMapping("/test")
	public String test() {
		return "Successfully run test endpoint.";
	}
	
	@PostMapping("/register")
	public ResponseEntity<Object> register(@RequestBody AuthUserDto dto, HttpServletResponse res){
		HttpHeaders headers = new HttpHeaders();
		try {
			UserDTO userDto = userService.register(dto);
        	String cookieValue = CookieUtil.buildCookieHeader("talentAiToken", AesUtil.encrypt(jwtUtil.generateToken(dto.getUsername())), 36000, true);
        	headers.add(HttpHeaders.SET_COOKIE, cookieValue);
			return ResponseEntity.ok().headers(headers).body(userDto);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(400).body(e.getLocalizedMessage());
		}
	}

	@PostMapping("/login")
	public ResponseEntity<UserDTO> login(@RequestBody AuthUserDto authDto, HttpServletResponse res){
		HttpHeaders headers = new HttpHeaders();
		UserDTO dto = null;
		try {
			dto = userService.login(authDto);
        	String cookieValue = CookieUtil.buildCookieHeader("talentAiToken", AesUtil.encrypt(jwtUtil.generateToken(dto.getUsername())), 36000, true);
        	headers.add(HttpHeaders.SET_COOKIE, cookieValue);
			return ResponseEntity.ok().headers(headers).body(dto);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(400).body(dto);
		}
	}
	
	@PostMapping("/authStatus")
	public ResponseEntity<UserDTO> authStatus(HttpServletRequest req){
		HttpHeaders headers = new HttpHeaders();
		try {
			String username = jwtUtil.extractUsername(AesUtil.decrypt(cookieUtil.extractTokenFromCookies(req)));
			UserDTO dto = UserDTO.fromEntity(masterData.loadUserViaUserName(username));
			return ResponseEntity.status(200).body(dto);
		} catch (Exception e) {
			return ResponseEntity.status(400).headers(headers).body(null);
		}
	}
	
	@PostMapping("/logout")
	public ResponseEntity<String> logout(HttpServletRequest req){
		HttpHeaders headers = new HttpHeaders();
		try {
	        String cookieValue = CookieUtil.deleteCookieHeader("talentAiToken", "/");
	        headers.add(HttpHeaders.SET_COOKIE, cookieValue);
			return ResponseEntity.status(200).headers(headers).body("Log out successfully...");
		} catch (Exception e) {
			return ResponseEntity.status(400).headers(headers).body(null);
		}
	}
	
	@PostMapping(value = "/updatePersonInfo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> updateUserProfile(@ModelAttribute UserDTO userDTO) {
        try {
            UserDTO updatedUser = userService.updateUserProfile(userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    
    @PostMapping("/fetchUserByUsername")
    public ResponseEntity<UserDTO> fetchUserByUsername(@RequestBody UserDTO reqDto){
    	UserDTO dto = null;
    	try {
    		User ur = masterData.loadUserViaUserName(reqDto.getUsername());
    		if(ur != null) {
    			dto = UserDTO.fromEntity(ur);    			
    		}
    	} catch (Exception e) {
    		e.printStackTrace();
    	}
    	return ResponseEntity.ok(dto);    	
    }
    
    @PostMapping("/downloadResume")
    public ResponseEntity downloadResumeStream(@RequestBody UserDTO reqDto) {
        try {
            Resource resource = fileStorageService.loadResource(reqDto.getResumeUrl());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"resume.pdf\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
