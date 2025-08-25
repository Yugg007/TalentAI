package com.talent.ai.utils;

import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CookieUtil {
	
    public String extractTokenFromCookies(HttpServletRequest request) {
    	System.out.println(request.getCookies());
        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if ("talentAiToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
    
    public static Cookie createCookie(String name, String value) {
        Cookie cookie = new Cookie(name, value);
        cookie.setMaxAge(60 * 60 * 10);         // in seconds
        cookie.setPath("/");             // "/"
        cookie.setHttpOnly(true);     // true: JS can't access
        return cookie;
    } 
    
    public static Cookie deleteCookie(String name, String path) {
        return createCookie(name, "");
    }
}
