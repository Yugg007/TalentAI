package com.talent.ai.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talent.ai.dto.ConnectionPageDTO;
import com.talent.ai.dto.UserConnectionDto;
import com.talent.ai.service.ConnectionService;
import com.talent.ai.utils.AesUtil;
import com.talent.ai.utils.CookieUtil;
import com.talent.ai.utils.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/connection")
public class ConnectionController {
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private CookieUtil cookieUtil;
	
	@Autowired
	private ConnectionService connectionService;
	
	public void sendInvite() {
		
	}
	
	@PostMapping("/loadConnections")
	public ResponseEntity<ConnectionPageDTO> loadConnections(HttpServletRequest req) throws Exception{
		String username = jwtUtil.extractUsername(AesUtil.decrypt(cookieUtil.extractTokenFromCookies(req)));
		ConnectionPageDTO dto = connectionService.fetchConnectionDto(username);
		return ResponseEntity.ok().body(dto);
	}
	
	@PostMapping("/sendConnectionRequest")
	public ResponseEntity<ConnectionPageDTO> sendConnectionRequest(@RequestBody UserConnectionDto dto){
		connectionService.sendConnectionRequest(dto);
		ConnectionPageDTO dto1 = connectionService.fetchConnectionDto(dto.getUsername());
		return ResponseEntity.ok().body(dto1);
	}
	
	@PostMapping("/acceptPendingRequest")
	public ResponseEntity<ConnectionPageDTO> acceptPendingRequest(@RequestBody UserConnectionDto dto){
		connectionService.acceptPendingRequest(dto);
		ConnectionPageDTO dto1 = connectionService.fetchConnectionDto(dto.getUsername());
		return ResponseEntity.ok().body(dto1);
	}

}
