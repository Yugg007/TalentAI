package com.talent.ai.core.controller;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/ai")
public class AiNotificationController {

    // A map to keep track of active user connections
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    @GetMapping(value = "/stream/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamAiUpdates(@PathVariable String userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // Keep alive
        
        this.emitters.put(userId, emitter);

        emitter.onCompletion(() -> this.emitters.remove(userId));
        emitter.onTimeout(() -> this.emitters.remove(userId));
        emitter.onError((e) -> this.emitters.remove(userId));

        return emitter;
    }

    // This method is called by your Kafka Listener when AI is finished
    public void sendUpdate(String userId, String aiResponse) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name("AI_TASK_COMPLETE")
                    .data(aiResponse));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }
}