package com.talent.ai.utils;

import java.util.Base64;

import org.springframework.stereotype.Component;

@Component
public class Decoder {
    public String decodeJwt(String jwt) {
        String[] parts = jwt.split("\\."); // header.payload.signature
        String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));

        System.out.println("Header: " + headerJson);
        System.out.println("Payload: " + payloadJson);
        return payloadJson;
    }
}
