"""
SkillGapAgent - orchestrates end-to-end skill-gap analysis between a
candidate resume and a job description.

Pipeline
--------
    1. Validate & parse both payloads into typed profiles (fail fast,
       fail loud, with a domain-specific exception).
    2. Build the candidate's full skill graph (declared + project +
       inferred skills), with an evidence trail per skill.
    3. Match JD required/preferred skills against that graph.
    4. Score the match (required %, preferred %, experience fit, overall).
    5. Surface candidate strengths backed by quantified achievements.
    6. Generate prioritized, actionable recommendations for any gaps.

The class holds no per-call mutable state, so a single instance
(`skill_gap_agent`) is safe to share across requests/threads. Each
collaborator is injectable for testing or for swapping in a smarter
implementation (e.g. an embedding-based matcher) without touching the
orchestration logic.
"""

from __future__ import annotations

import logging
import traceback
from typing import Optional

from pydantic import ValidationError

from orchestrator.agents.skill_gap_engine.skill_gap.evidence_builder import EvidenceBuilder
from orchestrator.agents.skill_gap_engine.skill_gap.graph_builder import SkillGraphBuilder
from orchestrator.agents.skill_gap_engine.skill_gap.matcher import SkillMatcher
from models.jd_profile import JDProfile
from models.resume_profile import ResumeProfile
from models.ats_result import AtsResult
from orchestrator.agents.skill_gap_engine.skill_gap.recommendation_engine import RecommendationEngine
from orchestrator.agents.skill_gap_engine.skill_gap.scorer import SkillScorer
from orchestrator.agents.skill_gap_engine.skill_gap.strength_analyzer import StrengthAnalyzer

logger = logging.getLogger(__name__)


class AtsScoreAnalysisError(Exception):
    """Raised when the resume/JD payloads cannot be parsed or analyzed."""


class AtsScoreAgent:
    def __init__(
        self,
        graph_builder: Optional[SkillGraphBuilder] = None,
        evidence_builder: Optional[EvidenceBuilder] = None,
        matcher: Optional[SkillMatcher] = None,
        scorer: Optional[SkillScorer] = None,
        strength_analyzer: Optional[StrengthAnalyzer] = None,
        recommendation_engine: Optional[RecommendationEngine] = None,
    ) -> None:
        self._graph_builder = graph_builder or SkillGraphBuilder()
        self._evidence_builder = evidence_builder or EvidenceBuilder()
        self._matcher = matcher or SkillMatcher()
        self._scorer = scorer or SkillScorer()
        self._strength_analyzer = strength_analyzer or StrengthAnalyzer()
        self._recommendation_engine = recommendation_engine or RecommendationEngine()

    def compare(self, resume_data: dict, jd_data: dict) -> dict:
        """Run the full pipeline and return a plain dict (JSON-ready)
        matching `SkillGapResult`.

        Raises:
            AtsScoreAnalysisError: if `resume_data`/`jd_data` don't
                conform to the expected shape.
        """
        resume, jd = self._parse_inputs(resume_data, jd_data)

        logger.info(
            "Starting skill-gap analysis for job_title=%r company=%r",
            jd.job_title,
            jd.company,
        )

        candidate_skills, raw_evidence = self._graph_builder.build(resume)
        evidence = self._evidence_builder.refine(raw_evidence)

        required_matches = self._matcher.match_many(jd.required_skills, candidate_skills)
        preferred_matches = self._matcher.match_many(jd.preferred_skills, candidate_skills)

        matched_required = sorted(m.jd_skill for m in required_matches if m.is_matched)
        missing_required = sorted(m.jd_skill for m in required_matches if not m.is_matched)
        matched_preferred = sorted(m.jd_skill for m in preferred_matches if m.is_matched)
        missing_preferred = sorted(m.jd_skill for m in preferred_matches if not m.is_matched)

        jd_skill_universe = {m.jd_skill for m in (*required_matches, *preferred_matches)}
        additional_skills = sorted(candidate_skills - jd_skill_universe)

        required_pct = self._scorer.match_percentage(required_matches)
        preferred_pct = self._scorer.match_percentage(preferred_matches)
        experience_pct = self._scorer.experience_fit(resume, jd)
        overall_fit = self._scorer.overall_fit_score(required_pct, preferred_pct, experience_pct)

        strengths = self._strength_analyzer.identify(
            resume, set(matched_required) | set(matched_preferred), evidence
        )
        recommendations = self._recommendation_engine.build(
            required_matches, preferred_matches, candidate_skills
        )

        try:
            result = AtsResult(
                matched_required_skills=matched_required,
                missing_required_skills=missing_required,
                matched_preferred_skills=matched_preferred,
                missing_preferred_skills=missing_preferred,
                additional_skills=additional_skills,
                required_match_percentage=required_pct,
                preferred_match_percentage=preferred_pct,
                overall_fit_score=overall_fit,
                skill_evidence=evidence,
                candidate_strengths=strengths,
                recommendations=recommendations,
                required_skill_matches=required_matches,
                preferred_skill_matches=preferred_matches,
            )
            
            logger.info(
                "Completed skill-gap analysis: required=%.2f%% preferred=%.2f%% overall=%.2f",
                required_pct,
                preferred_pct,
                overall_fit,
            )
            return result.model_dump(mode="json")

        except Exception as e:
            logger.error(f"❌ CRASHED WHILE CREATING AtsResult: {e}")
            traceback.print_exc()


    @staticmethod
    def _parse_inputs(resume_data: dict, jd_data: dict) -> tuple[ResumeProfile, JDProfile]:
        try:
            resume = ResumeProfile.model_validate(resume_data)
        except ValidationError as exc:
            logger.error("Invalid resume payload: %s", exc)
            raise AtsScoreAnalysisError(f"Invalid resume payload: {exc}") from exc

        try:
            jd = JDProfile.model_validate(jd_data)
        except ValidationError as exc:
            logger.error("Invalid JD payload: %s", exc)
            raise AtsScoreAnalysisError(f"Invalid JD payload: {exc}") from exc

        return resume, jd


# Module-level singleton mirroring the original module's usage pattern -
# stateless, so sharing a single instance across requests is safe.
ats_score_agent = AtsScoreAgent()
