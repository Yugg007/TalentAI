"""
Generates actionable, prioritized recommendations for closing skill
gaps - distinguishing a genuine cold gap from one the candidate could
plausibly close quickly given clearly adjacent experience.
"""

from __future__ import annotations

from .hierarchy import find_transferable_group
from models.skill_match import SkillMatch
from models.skill_recommendaion import SkillRecommendation

_PRIORITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}


class RecommendationEngine:
    def build(
        self,
        required_matches: list[SkillMatch],
        preferred_matches: list[SkillMatch],
        candidate_skills: set[str],
    ) -> list[SkillRecommendation]:
        recommendations = [
            self._build_recommendation(match, candidate_skills, is_required=True)
            for match in required_matches
            if not match.is_matched
        ]
        recommendations += [
            self._build_recommendation(match, candidate_skills, is_required=False)
            for match in preferred_matches
            if not match.is_matched
        ]

        recommendations.sort(key=lambda r: _PRIORITY_ORDER.get(r.priority, 99))
        return recommendations

    @staticmethod
    def _build_recommendation(
        match: SkillMatch, candidate_skills: set[str], is_required: bool
    ) -> SkillRecommendation:
        skill = match.jd_skill
        group = find_transferable_group(skill)
        transferable_from = sorted(group & candidate_skills) if group else []

        if transferable_from:
            priority = "high" if is_required else "medium"
            reason = (
                f"Missing '{skill}', but has adjacent experience with "
                f"{', '.join(transferable_from)}"
            )
            suggestion = (
                f"Highlight transferable concepts from "
                f"{', '.join(transferable_from)} in the resume/interview, and "
                f"be ready to speak to a quick ramp-up plan for {skill}"
            )
        else:
            priority = "critical" if is_required else "low"
            reason = f"No evidence of '{skill}' found anywhere in the resume"
            suggestion = (
                f"Consider a focused project or certification in {skill} before "
                f"applying, or address the gap directly in a cover letter"
            )

        return SkillRecommendation(
            skill=skill,
            priority=priority,
            reason=reason,
            suggestion=suggestion,
            transferable_from=transferable_from,
        )
