package com.talent.ai.core.service;

import java.io.IOException;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import com.talent.ai.core.dto.ATSTask;
import com.talent.ai.core.dto.ATSTaskResponse;
import com.talent.ai.core.repository.AtsRepository;

@Service
public class AtsService {

    private final AtsRepository repository;

    public AtsService(AtsRepository repository) {
        this.repository = repository;
    }
    
    public String parsePdf(MultipartFile file) throws IOException {

        try (PDDocument document = Loader.loadPDF(file.getBytes())) {

            PDFTextStripper pdfStripper = new PDFTextStripper();

            return pdfStripper.getText(document);
        }
    }

    public Optional<ATSTaskResponse> checkRequestHashPresent(
            String username,
            String requestHash) {

        Optional<ATSTask> cached =
                repository.findByUsernameAndRequestHash(
                        username,
                        requestHash);

        if (cached.isEmpty()) {
            return Optional.empty();
        }

        ATSTask atsTask = cached.get();

        ATSTaskResponse response = new ATSTaskResponse();
        response.setTaskId(atsTask.getId());
        response.setStatus(atsTask.getStatus());

        if ("PENDING".equals(atsTask.getStatus())) {
            response.setMessage("Request is already in progress");
        } else if ("COMPLETED".equals(atsTask.getStatus())) {
            response.setMessage("Using cached result");
            response.setContent(atsTask.getContent());
            response.setResult(atsTask.getResult());
        } else if ("FAILED".equals(atsTask.getStatus())) {
            response.setMessage("Previous request failed");
            response.setError(atsTask.getError());
        }

        return Optional.of(response);
    }
 
    public Optional<ATSTaskResponse> requestAiAnalysis(String username, String resumeText, String jdText, String requestHash) {
    	ATSTask task = new ATSTask(username, resumeText, jdText, requestHash, "PENDING");        
        repository.save(task);
 
        ATSTaskResponse response = new ATSTaskResponse();
        response.setTaskId(task.getId());
        response.setStatus(task.getStatus());

        return Optional.of(response);
    }

    public ATSTaskResponse getTaskSummary(String taskId, String username) {
        return repository.findById(taskId)
                .filter(task -> username != null && username.equals(task.getUsername()))
                .map(task -> {
                    ATSTaskResponse response = new ATSTaskResponse();
                    response.setTaskId(task.getId());
                    response.setStatus(task.getStatus());
                    response.setResult(task.getResult());
                    response.setContent(task.getContent());
                    response.setError(task.getError());
                    return response;
                })
                .orElse(null);
	}
}