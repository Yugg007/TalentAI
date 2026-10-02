package com.talent.ai.core.service;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;

@Service
public class FileStorageService {

    private final String UPLOAD_DIR = "/Users/yogendrajhala650gmail.com/Desktop/Developer/Projects/TalentAI/storage";

    public String saveResume(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);

            // 1. Create directory on D drive if it doesn't exist
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Generate a unique file name to avoid name collisions (e.g., 1711234567890_resume.pdf)
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = System.currentTimeMillis() + "_" + originalFileName;

            // 3. Resolve the full destination path
            Path filePath = uploadPath.resolve(uniqueFileName);

            // 4. Copy file bytes to the target location
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return the path or filename to be saved in your MySQL database (resume_url)
            return uniqueFileName; // or filePath.toString()

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
        }
    }

	public Resource loadResource(String fileName) throws IOException {
		// TODO Auto-generated method stub
		 String filePathUrl = UPLOAD_DIR + "/" + fileName;
        Path filePath = Paths.get(filePathUrl);
        Resource resource = new InputStreamResource(Files.newInputStream(filePath));
		return resource;
	}
}
