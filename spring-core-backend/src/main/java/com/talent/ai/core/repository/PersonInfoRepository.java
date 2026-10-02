package com.talent.ai.core.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talent.ai.core.model.PersonInfo;

public interface PersonInfoRepository extends JpaRepository<PersonInfo, Long> {
    Optional<PersonInfo> findByUserUsername(String username);
}
