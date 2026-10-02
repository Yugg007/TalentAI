import logging
from typing import Optional
from models.resume_profile import ResumeProfile
from normalizers.resume_normalizer import ResumeNormalizer
from utils.json_parser import extract_json

logger = logging.getLogger(__name__)

def process_resume_response(response: str) -> Optional[ResumeProfile]:
    try:
        logger.info("Processing resume response...")
        
        # 1. Extract and parse the JSON string into a Python dict
        data = extract_json(response)
        if not data:
            logger.error("Failed to extract valid JSON from resume response string.")
            return None
            
        logger.debug(f"Resume extracted data")
        print(data)  # Debugging: print the extracted data
        # 2. Validate using Pydantic
        resume = ResumeProfile.model_validate(data)

        # 3. Normalize values (lowercase skills, format dates, etc.)
        normalized_resume = ResumeNormalizer.normalize(resume)
        logger.info("Resume successfully processed and normalized.")
        
        return normalized_resume

    except Exception as e:
        logger.error(f"Error processing resume response: {str(e)}", exc_info=True)
        return None