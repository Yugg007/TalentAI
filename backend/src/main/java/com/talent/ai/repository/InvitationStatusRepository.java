package com.talent.ai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.talent.ai.model.InviteStatus;

public interface InvitationStatusRepository extends JpaRepository<InviteStatus, Long> {

    @Query("""
        SELECT is FROM InviteStatus is
        WHERE is.fromUser.userId = :userId OR is.toUser.userId = :userId
    """)
    List<InviteStatus> findAllPendingUsers(@Param("userId") Long userId);
}
