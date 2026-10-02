package com.talent.ai.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.talent.ai.core.controller.AiNotificationController;

@Component
public class AiTaskListener {

    @Autowired
    private AiNotificationController notificationController;

    @KafkaListener(topics = "ai_task_completed", groupId = "talent-ai-group")
    public void listen(String message) {
        // Assume message is JSON: { "userId": "123", "response": "..." }
        // Parse message and notify the specific user
    	String userId = "";
    	String responseData = "";
        notificationController.sendUpdate(userId, responseData);
    }
}