import json
import logging
from typing import Optional
from models.jd_profile import JDProfile
from normalizers.jd_normalizer import JDNormalizer
from utils.json_parser import extract_json

# Use standard logging instead of print statements for production readiness
logger = logging.getLogger(__name__)

def process_jd_response(response: str) -> Optional[JDProfile]:
    try:
        logger.info(f"JD response received")
        
        # 1. Parse JSON string
        data = extract_json(response)
        if not data:
            logger.error("Failed to extract JSON from response string")
            return None
            
        logger.debug(f"JD extracted data")

        # 2. Validate using Pydantic
        jd = JDProfile.model_validate(data)

        # 3. Normalize values (e.g., standardizing text/skills)
        normalized_jd = JDNormalizer.normalize(jd)
        logger.info(f"Normalized JD successfully processed.")
        
        return normalized_jd

    except Exception as e:
        logger.error(f"Error processing JD response: {str(e)}", exc_info=True)
        return None