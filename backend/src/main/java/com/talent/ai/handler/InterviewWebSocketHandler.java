package com.talent.ai.handler;

import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class InterviewWebSocketHandler extends TextWebSocketHandler {
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Echo or broadcast logic here
        session.sendMessage(new TextMessage("Received: " + message.getPayload()));
    }
}

