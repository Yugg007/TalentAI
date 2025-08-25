package com.talent.ai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.talent.ai.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
