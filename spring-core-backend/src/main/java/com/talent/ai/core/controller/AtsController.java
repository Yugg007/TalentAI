package com.talent.ai.core.controller;

import java.util.Optional;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
        @RequestParam("username") String username
    ) throws Exception {
    	Optional<ATSTaskResponse> response;
        
        // 1. Extract Text from PDF (Replaces extractTextFromPdf)
    	String resumeText = "";
    	try {
    		resumeText = atsService.parsePdf(file);
		} catch (Exception e) {
			// TODO: handle exception
		}
    	
    	if(resumeText.isEmpty()) throw new Exception("Resume is blank, Please reupload resume...");
        
        
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

        // 4. Send to AI Worker (Via Kafka/HTTP)
        // We "drop work" here as per your diagram
        response = atsService.requestAiAnalysis(username, resumeText, jdText, requestHash);

        return ResponseEntity.accepted().body(response.get());
    }
    
    @PostMapping("/summary/{taskId}")
    public ResponseEntity<Object> getSummary(
            @PathVariable String taskId) {

        return ResponseEntity.ok(
                atsService.getTaskSummary(taskId)
        );
    }
}