from typing import Type, TypeVar, Optional
from pydantic import BaseModel
from utils.json_parser import extract_json
import logging

logger = logging.getLogger(__name__)

# Create a Generic Type bound to Pydantic models
T = TypeVar('T', bound=BaseModel)

def safe_process_pipeline_response(
    raw_response: str, 
    model_cls: Type[T], 
    normalizer=None
) -> Optional[T]:
    """
    A single, unified processor for ANY LLM response mapping to a Pydantic Model.
    """
    try:
        # 1. Clean & Extract JSON text safely
        data = extract_json(raw_response)
        if not data:
            logger.error(f"Failed to extract JSON for schema: {model_cls.__name__}")
            return None
            
        # 2. Strict Type Validation
        validated_object = model_cls.model_validate(data)

        # 3. Apply optional text sanitization rules
        if normalizer and hasattr(normalizer, 'normalize'):
            validated_object = normalizer.normalize(validated_object)
            
        return validated_object

    except Exception as e:
        logger.error(f"Pipeline processing failed for model {model_cls.__name__}: {str(e)}", exc_info=True)
        return None