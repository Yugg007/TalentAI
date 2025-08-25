package com.talent.ai.model;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
public class GoogleConfig {
    @Value("${google.client.id}")
    public String clientId;

    @Value("${google.client.secret}")
    public String clientSecret;

    @Value("${google.redirect.uri}")
    public String redirectUri;
}
