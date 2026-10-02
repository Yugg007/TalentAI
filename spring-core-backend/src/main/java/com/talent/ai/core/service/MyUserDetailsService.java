package com.talent.ai.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.talent.ai.core.model.MasterData;
import com.talent.ai.core.model.User;



@Component
public class MyUserDetailsService implements UserDetailsService {
	@Autowired
	private MasterData masterData;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = masterData.loadUserViaUserName(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }
}
