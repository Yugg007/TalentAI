package com.talent.ai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talent.ai.model.UserConnection;

public interface UserConnectionRepository extends JpaRepository<UserConnection, Long> {
	boolean existsByUser1UserIdAndUser2UserId(Long userId, Long userId2);
	
	List<UserConnection> findByUser1_UsernameOrUser2_Username(String username1, String username2);

	List<UserConnection> findByUser1_UsernameAndUser2_Username(String username, String targetUsername);

}
