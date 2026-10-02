"""
Matches a set of JD skills against the candidate's skill graph.

Strategy cascade (first hit wins):
    1. Exact match on canonical form.
    2. Fuzzy string match - absorbs typos / minor phrasing drift that
       alias resolution didn't anticipate.
    3. Hierarchical / transferable-group match - a *weak* signal (never
       counted as a hard requirement match) used only to power smarter
       recommendations for genuine-but-adjacent gaps.
"""

from __future__ import annotations

from typing import Iterable

from .aliases import resolve_alias
from .hierarchy import find_transferable_group
from models.match_type import MatchType
from models.skill_match import SkillMatch
from .utils import DEFAULT_FUZZY_THRESHOLD, best_fuzzy_match, clean_text


class SkillMatcher:
    def __init__(self, fuzzy_threshold: float = DEFAULT_FUZZY_THRESHOLD) -> None:
        self._fuzzy_threshold = fuzzy_threshold

    @staticmethod
    def normalize(raw_skill: str) -> str:
        return resolve_alias(clean_text(raw_skill))

    def match_many(
        self, jd_skills: Iterable[str], candidate_skills: set[str]
    ) -> list[SkillMatch]:
        return [
            self._match_one(self.normalize(raw), candidate_skills) for raw in jd_skills
        ]

    def _match_one(self, jd_skill: str, candidate_skills: set[str]) -> SkillMatch:
        if not jd_skill:
            return SkillMatch(jd_skill=jd_skill)

        if jd_skill in candidate_skills:
            return SkillMatch(
                jd_skill=jd_skill,
                matched_candidate_skill=jd_skill,
                match_type=MatchType.EXACT,
                confidence=1.0,
                is_matched=True,
            )

        fuzzy_match, score = best_fuzzy_match(
            jd_skill, candidate_skills, threshold=self._fuzzy_threshold
        )
        if fuzzy_match:
            return SkillMatch(
                jd_skill=jd_skill,
                matched_candidate_skill=fuzzy_match,
                match_type=MatchType.FUZZY,
                confidence=round(score, 2),
                is_matched=True,
            )

        group = find_transferable_group(jd_skill)
        if group:
            overlap = group & candidate_skills
            if overlap:
                return SkillMatch(
                    jd_skill=jd_skill,
                    matched_candidate_skill=sorted(overlap)[0],
                    match_type=MatchType.HIERARCHICAL,
                    confidence=0.4,
                    is_matched=False,  # soft signal only, not a hard match
                )

        return SkillMatch(jd_skill=jd_skill)
