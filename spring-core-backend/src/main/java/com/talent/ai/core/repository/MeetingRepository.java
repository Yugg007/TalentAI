package com.talent.ai.core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talent.ai.core.model.MeetingDetail;

public interface MeetingRepository extends JpaRepository<MeetingDetail, Long>{

	List<MeetingDetail> findByAdmin(String username);
	
	List<MeetingDetail> findByAdminOrJoineeContaining(String admin, String joineePart);

	MeetingDetail findByEventId(String eventId);

}
