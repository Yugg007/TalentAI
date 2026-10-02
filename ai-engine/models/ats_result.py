
from __future__ import annotations

from typing import Dict, List

from pydantic import BaseModel, Field


from models.skill_evidence_item import SkillEvidenceItem
from models.skill_match import SkillMatch
from models.skill_recommendaion import SkillRecommendation  
from models.candidate_strength import CandidateStrength


# ==========================================================
# ATS Score Models
# ==========================================================


class AtsResult(BaseModel):
    """
    Final ATS analysis result.
    """

    # ------------------------------------------------------------------ #
    # Skill Matching Summary
    # ------------------------------------------------------------------ #

    matched_required_skills: List[str] = Field(default_factory=list)

    missing_required_skills: List[str] = Field(default_factory=list)

    matched_preferred_skills: List[str] = Field(default_factory=list)

    missing_preferred_skills: List[str] = Field(default_factory=list)

    additional_skills: List[str] = Field(default_factory=list)

    # ------------------------------------------------------------------ #
    # ATS Scores
    # ------------------------------------------------------------------ #

    required_match_percentage: float = 0.0

    preferred_match_percentage: float = 0.0

    overall_fit_score: float = 0.0

    # ------------------------------------------------------------------ #
    # Skill Evidence
    # ------------------------------------------------------------------ #

    skill_evidence: Dict[
        str,
        List[SkillEvidenceItem]
    ] = Field(default_factory=dict)

    # ------------------------------------------------------------------ #
    # Candidate Analysis
    # ------------------------------------------------------------------ #

    candidate_strengths: List[
        CandidateStrength
    ] = Field(default_factory=list)

    recommendations: List[
        SkillRecommendation
    ] = Field(default_factory=list)

    # ------------------------------------------------------------------ #
    # Detailed Matching Information
    # ------------------------------------------------------------------ #

    required_skill_matches: List[
        SkillMatch
    ] = Field(default_factory=list)

    preferred_skill_matches: List[
        SkillMatch
    ] = Field(default_factory=list)

    # ------------------------------------------------------------------ #
    # Convenience Properties
    # ------------------------------------------------------------------ #

    @property
    def total_required_skills(self) -> int:
        return (
            len(self.matched_required_skills)
            + len(self.missing_required_skills)
        )

    @property
    def total_preferred_skills(self) -> int:
        return (
            len(self.matched_preferred_skills)
            + len(self.missing_preferred_skills)
        )

    @property
    def total_missing_skills(self) -> int:
        return (
            len(self.missing_required_skills)
            + len(self.missing_preferred_skills)
        )

    @property
    def has_required_skill_gap(self) -> bool:
        return bool(self.missing_required_skills)

    @property
    def has_preferred_skill_gap(self) -> bool:
        return bool(self.missing_preferred_skills)

    @property
    def is_good_fit(self) -> bool:
        return self.overall_fit_score >= 75.0

    @property
    def is_strong_fit(self) -> bool:
        return self.overall_fit_score >= 90.0

    @property
    def matched_skill_count(self) -> int:
        return (
            len(self.matched_required_skills)
            + len(self.matched_preferred_skills)
        )

    @property
    def missing_skill_count(self) -> int:
        return (
            len(self.missing_required_skills)
            + len(self.missing_preferred_skills)
        )