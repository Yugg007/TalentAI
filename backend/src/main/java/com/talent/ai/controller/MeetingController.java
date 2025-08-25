package com.talent.ai.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talent.ai.model.MeetingDetail;
import com.talent.ai.service.MeetingService;
import com.talent.ai.utils.AesUtil;
import com.talent.ai.utils.CookieUtil;
import com.talent.ai.utils.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/meeting")
public class MeetingController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CookieUtil cookieUtil;
    
    @Autowired
    private MeetingService meetingService;

    
    @GetMapping("/test")
    public String test() {
    	return "test";
    }
	
    @PostMapping("/schedule")
    public String scheduleMeeting(HttpServletRequest req, @RequestBody Map<Object, Object> mp) throws Exception {
        String token = AesUtil.decrypt(cookieUtil.extractTokenFromCookies(req));
        String username = jwtUtil.extractUsername(token);
        String accessToken = (String) jwtUtil.getClaimValue(token, "googleAccessToken");
        
        String meetLink = meetingService.createMeeting(username, accessToken, mp);

        System.out.println("Meeting link - " + meetLink);

        return "Meeting scheduled successfully. Join link: " + meetLink;
    }

    
    @PostMapping("/upcoming-meetings")
    public List<MeetingDetail> fetchUpcomingMeeting(HttpServletRequest req) throws Exception{
        String token = AesUtil.decrypt(cookieUtil.extractTokenFromCookies(req));
        String username = jwtUtil.extractUsername(token);
    	List<MeetingDetail> pojos = meetingService.fetchAll(username);
    	return pojos;
    }
    
    @PostMapping("/delete-meeting")
    public String deleteMeeting(HttpServletRequest req, @RequestBody Map<String, String> mp) throws Exception {
        String token = AesUtil.decrypt(cookieUtil.extractTokenFromCookies(req));
        String username = jwtUtil.extractUsername(token);
        String accessToken = (String) jwtUtil.getClaimValue(token, "googleAccessToken");
    	meetingService.deleteMeeting(username, accessToken, mp.get("eventId"));
    	
    	return "Deleted meeting";
    }
	

}
