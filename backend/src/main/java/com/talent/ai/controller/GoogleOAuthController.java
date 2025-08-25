package com.talent.ai.controller;

import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.talent.ai.model.GoogleConfig;
import com.talent.ai.model.MasterData;
import com.talent.ai.utils.AesUtil;
import com.talent.ai.utils.CookieUtil;
import com.talent.ai.utils.Decoder;
import com.talent.ai.utils.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/google")
public class GoogleOAuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CookieUtil cookieUtil;
    
    @Autowired
    private Decoder decoder;
    
    @Autowired
    private MasterData masterData;

    private final GoogleConfig config;

    public GoogleOAuthController(GoogleConfig config) {
        this.config = config;
    }

    // 1️⃣ Start OAuth flow
    @GetMapping("/oauth2/authorize")
    public void authorize(HttpServletRequest req, HttpServletResponse response) throws Exception {
        List<String> scopes = List.of("https://www.googleapis.com/auth/calendar.events", 
        		"https://www.googleapis.com/auth/userinfo.profile",
        		"https://www.googleapis.com/auth/userinfo.email");

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                config.clientId,
                config.clientSecret,
                scopes
        ).setAccessType("offline").build();

        String username = jwtUtil.extractUsername(AesUtil.decrypt(cookieUtil.extractTokenFromCookies(req)));
        String url = flow.newAuthorizationUrl()
                .setRedirectUri(config.redirectUri)
                .setState(masterData.fetchEmailViaUserName(username))
                .build();

        response.sendRedirect(url);
    }

    // 2️⃣ Callback after user consents
    @GetMapping("/oauth2callback")
    public ResponseEntity<String> oauth2Callback(
            @RequestParam String code,
            @RequestParam String state,
            HttpServletRequest req) throws Exception {

        HttpHeaders headers = new HttpHeaders();

        GoogleAuthorizationCodeTokenRequest tokenRequest = new GoogleAuthorizationCodeTokenRequest(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                config.clientId,
                config.clientSecret,
                code,
                config.redirectUri
        );

        GoogleTokenResponse tokenResponse = tokenRequest.execute();
        String accessToken = tokenResponse.getAccessToken();
        String payload = decoder.decodeJwt(tokenResponse.getIdToken());
        JSONObject jsonObj = new JSONObject(payload);
        String email = jsonObj.getString("email");      

        String token = AesUtil.decrypt(cookieUtil.extractTokenFromCookies(req));

        if (email.equalsIgnoreCase(state)) {
            String newToken = jwtUtil.addClaim(token, "googleAccessToken", accessToken);
            String cookieValue = "talentAiToken=" + AesUtil.encrypt(newToken) +
                    "; Max-Age=36000; Path=/; HttpOnly; SameSite=None; Secure";
            headers.add(HttpHeaders.SET_COOKIE, cookieValue);
            return ResponseEntity.ok().headers(headers).body("<script>window.close();</script>");
        } else {
            throw new Exception("Username mismatch.");
        }
    }

    @PostMapping("/check-token")
    public Map<String, Boolean> checkToken(HttpServletRequest req) throws Exception {
        String token = AesUtil.decrypt(cookieUtil.extractTokenFromCookies(req));
        String googleAccessToken = (String) jwtUtil.getClaimValue(token, "googleAccessToken");
        return Map.of("authorized", googleAccessToken != null);
    }
}
