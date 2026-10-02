from pydantic import BaseModel, Field
from typing import List

class SkillRecommendation(BaseModel):
    skill: str
    priority: str  # "critical" | "high" | "medium" | "low"
    reason: str
    suggestion: str
    transferable_from: List[str] = Field(default_factory=list)