
from pydantic import BaseModel
from typing import Optional
from models.skill_source import SkillSource

class SkillEvidenceItem(BaseModel):
    skill: str
    source: SkillSource
    context: str
    snippet: Optional[str] = None
    confidence: float = 1.0
    recency_weight: float = 1.0