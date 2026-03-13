package com.tnc.chatadvisor.repository;

import com.tnc.chatadvisor.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT c FROM ChatSession c WHERE c.userId = :userId ORDER BY c.createdAt DESC")
    List<ChatSession> findRecentChatsByUserId(@Param("userId") String userId);
}
