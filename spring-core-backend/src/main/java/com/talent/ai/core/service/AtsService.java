package com.talent.ai.core.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.bson.Document;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.talent.ai.core.dto.ATSTask;
import com.talent.ai.core.dto.ATSTaskResponse;
import com.talent.ai.core.repository.AtsRepository;

@Service
public class AtsService {

    @Autowired
    private AtsRepository repository;
    private final MongoTemplate mongoTemplate;
    
    public AtsService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
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
        } else if ("FAILED".equals(atsTask.getStatus())) {
            response.setMessage("Previous request failed");
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

	public Object getTaskSummary(String taskId) {
		// TODO Auto-generated method stub
		
		try {
			Object obj = mongoTemplate.findById(
					taskId,
			        Document.class,
			        "ats_task"
			);
			System.out.print(obj);
			return obj;
		}
		catch(Exception e) {
			e.printStackTrace();
		}
		
		return null;
		
		
//		Optional<ATSTask> optionalTask = repository.findById(taskId);
//		if (optionalTask.isEmpty()) {
//            return null;
//        }
//		
//		ATSTask task = optionalTask.get();
//		
//		return new ATSTaskResponse(
//                task.getId(),
//                task.getContent(),
//                "",
//                task.getStatus()
//        );
	}
}