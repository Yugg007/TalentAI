from __future__ import annotations

from pydantic import BaseModel

from typing import List, Dict
from models.skill_evidence_item import SkillEvidenceItem
from models.skill_match import SkillMatch
from models.skill_recommendaion import SkillRecommendation
from models.candidate_strength import CandidateStrength

class SkillGapResult(BaseModel):
    matched_required_skills: List[str]
    missing_required_skills: List[str]
    matched_preferred_skills: List[str]
    missing_preferred_skills: List[str]
    additional_skills: List[str]

    required_match_percentage: float
    preferred_match_percentage: float
    overall_fit_score: float

    skill_evidence: Dict[str, List[SkillEvidenceItem]]
    candidate_strengths: List[CandidateStrength]
    recommendations: List[SkillRecommendation]

    required_skill_matches: List[SkillMatch]
    preferred_skill_matches: List[SkillMatch]