"""
Turns raw skill matches into the percentage and composite scores exposed
in the final report.

Weighting rationale (tunable constants below):
    required skills matter most for pass/fail ATS screening, preferred
    skills are a tiebreaker, and years-of-experience fit rounds out an
    overall triage score used for ranking candidates against a JD.
"""

from __future__ import annotations
from models.jd_profile import JDProfile
from models.resume_profile import ResumeProfile
from models.skill_match import SkillMatch

REQUIRED_WEIGHT = 0.65
PREFERRED_WEIGHT = 0.20
EXPERIENCE_WEIGHT = 0.15

# Shortfalls beyond this many years below the JD minimum are treated as
# equally severe (further shortfall doesn't keep lowering the score).
_MAX_PENALIZED_SHORTFALL_YEARS = 2.0
_SHORTFALL_PENALTY_POINTS = 60.0


class SkillScorer:
    def match_percentage(self, matches: list[SkillMatch]) -> float:
        """Percentage of `matches` that are hard matches (exact/fuzzy).
        An empty requirement list is treated as fully satisfied (100%),
        since there is nothing to be missing."""
        if not matches:
            return 100.0
        hard_matches = sum(1 for m in matches if m.is_matched)
        return round((hard_matches / len(matches)) * 100, 2)

    def experience_fit(self, resume: ResumeProfile, jd: JDProfile) -> float:
        years = resume.experience_years or 0.0
        minimum = jd.minimum_experience
        preferred = jd.preferred_experience

        if minimum is None:
            return 100.0

        if years < minimum:
            shortfall = min(minimum - years, _MAX_PENALIZED_SHORTFALL_YEARS)
            penalty = (shortfall / _MAX_PENALIZED_SHORTFALL_YEARS) * _SHORTFALL_PENALTY_POINTS
            return round(max(0.0, 100.0 - penalty), 2)

        if preferred and preferred > minimum:
            if years >= preferred:
                return 100.0
            progress = (years - minimum) / (preferred - minimum)
            return round(80.0 + min(progress, 1.0) * 20.0, 2)

        return 90.0

    def overall_fit_score(
        self, required_pct: float, preferred_pct: float, experience_pct: float
    ) -> float:
        score = (
            required_pct * REQUIRED_WEIGHT
            + preferred_pct * PREFERRED_WEIGHT
            + experience_pct * EXPERIENCE_WEIGHT
        )
        return round(score, 2)
