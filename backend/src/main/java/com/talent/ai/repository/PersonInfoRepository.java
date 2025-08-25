package com.talent.ai.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talent.ai.model.PersonInfo;

public interface PersonInfoRepository extends JpaRepository<PersonInfo, Long>{

}
