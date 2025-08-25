package com.talent.ai.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talent.ai.dto.AuthUserDto;
import com.talent.ai.dto.UserDTO;
import com.talent.ai.model.MasterData;
import com.talent.ai.model.User;
import com.talent.ai.service.UserService;
import com.talent.ai.utils.AesUtil;
import com.talent.ai.utils.CookieUtil;
import com.talent.ai.utils.JwtUtil;

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
	        String cookieValue = "talentAiToken=" +  AesUtil.encrypt(jwtUtil.generateToken(dto.getUsername())) +
	        		 "; Max-Age=36000; Path=/; HttpOnly; SameSite=None; Secure";
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
	        String cookieValue = "talentAiToken=" +  AesUtil.encrypt(jwtUtil.generateToken(dto.getUsername())) +
	        		 "; Max-Age=36000; Path=/; HttpOnly; SameSite=None; Secure";
	        headers.add(HttpHeaders.SET_COOKIE, cookieValue);
		} catch (Exception e) {
			return ResponseEntity.status(400).headers(headers).body(dto);
		}
		return ResponseEntity.ok().headers(headers).body(dto);
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
	        String cookieValue = "talentAiToken=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure";
	        headers.add(HttpHeaders.SET_COOKIE, cookieValue);
			return ResponseEntity.status(200).headers(headers).body("Log out successfully...");
		} catch (Exception e) {
			return ResponseEntity.status(400).headers(headers).body(null);
		}
	}
	
    @PostMapping("/updatePersonInfo")
    public ResponseEntity<UserDTO> updateUserProfile(@RequestBody UserDTO userDTO) {
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

}
