package com.talent.ai.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.talent.ai.model.MasterData;
import com.talent.ai.model.User;

@Component
public class MyUserDetailsService {
	@Autowired
	private MasterData masterData;

	public UserDetails loadUserByUsername(String username) {
        User user = masterData.loadUserViaUserName(username);
        if(user == null) {
        	return (UserDetails) new UsernameNotFoundException("User not found with username: " + username);
        }
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password("pass")
                .roles("USER") // or use user.getRoles() if dynamic
                .build();
    }
}
