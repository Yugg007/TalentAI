
from pydantic import BaseModel
from typing import Optional
from models.match_type import MatchType

class SkillMatch(BaseModel):
    jd_skill: str
    matched_candidate_skill: Optional[str] = None
    match_type: Optional[MatchType] = None
    confidence: float = 0.0
    is_matched: bool = False
