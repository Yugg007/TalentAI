package com.talent.ai.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import java.util.Locale;

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
        String role = user.getRole() == null ? "candidate" : user.getRole().toLowerCase(Locale.ROOT);
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
            .roles(role.toUpperCase(Locale.ROOT))
                .build();
    }
}
