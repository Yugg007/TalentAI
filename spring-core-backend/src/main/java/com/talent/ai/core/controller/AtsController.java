package com.talent.ai.core.controller;

import java.util.Optional;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.talent.ai.core.dto.ATSTaskResponse;
import com.talent.ai.core.service.AtsService;

@RestController
@RequestMapping("/ats")
public class AtsController {

    @Autowired
    private AtsService atsService;

    @PostMapping("/generate-score")
    public ResponseEntity<ATSTaskResponse> generateScore(
        @RequestParam("pdf") MultipartFile file,
        @RequestParam("jobDescription") String jdText,
        @AuthenticationPrincipal UserDetails authenticatedUser
    ) {
        if (file == null || file.isEmpty()) {
            return badRequest("Choose a PDF resume to continue.");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            return badRequest("The resume must be 10 MB or smaller.");
        }
        if (jdText == null || jdText.isBlank()) {
            return badRequest("Add a job description or role requirements to continue.");
        }
        if (authenticatedUser == null || authenticatedUser.getUsername().isBlank()) {
            return badRequest("Sign in before starting a resume fit review.");
        }
        String username = authenticatedUser.getUsername();

    	Optional<ATSTaskResponse> response;
        
        // 1. Extract Text from PDF (Replaces extractTextFromPdf)
    	String resumeText = "";
        try {
    		resumeText = atsService.parsePdf(file);
		} catch (Exception e) {
            return badRequest("We couldn’t read that PDF. Try a text-based PDF resume.");
		}
        if (resumeText.isBlank()) {
            return badRequest("No readable text was found in the resume. Try a text-based PDF.");
        }
        
        
    	String normalizedResume =
    	        resumeText.trim().replaceAll("\\s+", " ");

    	String normalizedJd =
    	        jdText.trim().replaceAll("\\s+", " ");


    	String requestHash = DigestUtils.sha256Hex(
    	        String.join("||",
    	                normalizedResume,
    	                normalizedJd
    	        )
    	);
        
        // 3. Cache Check (Replaces AtsResponseFromCache)
    	response = atsService.checkRequestHashPresent(username, requestHash);
        if (response.isPresent()) {
            return ResponseEntity.ok(response.get());
        }

        // The AI scheduler picks up the persisted PENDING task from MongoDB.
        response = atsService.requestAiAnalysis(username, resumeText, jdText, requestHash);

        return ResponseEntity.accepted().body(response.get());
    }

    private ResponseEntity<ATSTaskResponse> badRequest(String message) {
        ATSTaskResponse response = new ATSTaskResponse();
        response.setMessage(message);
        response.setError(message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @PostMapping("/summary/{taskId}")
    public ResponseEntity<ATSTaskResponse> getSummary(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserDetails authenticatedUser) {
        ATSTaskResponse response = authenticatedUser == null
                ? null
                : atsService.getTaskSummary(taskId, authenticatedUser.getUsername());
        if (response == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(response);
    }
}