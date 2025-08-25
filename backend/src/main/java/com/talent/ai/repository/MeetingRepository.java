package com.talent.ai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talent.ai.model.MeetingDetail;

public interface MeetingRepository extends JpaRepository<MeetingDetail, Long>{

	List<MeetingDetail> findByAdmin(String username);

	MeetingDetail findByEventId(String eventId);

}
