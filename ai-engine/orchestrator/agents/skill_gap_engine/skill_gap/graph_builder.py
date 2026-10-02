"""
Builds the candidate's full skill graph from a ResumeProfile.

"Skill graph" here means: a flat, normalized set of skills the candidate
can credibly claim, plus an evidence trail explaining *why* each skill is
in that set (declared skill list, a specific project, a specific
achievement bullet, or inferred from a related, more advanced skill).
"""

from __future__ import annotations

import logging
from collections import defaultdict

from models.resume_profile import ResumeProfile
from .aliases import resolve_alias
from .hierarchy import get_implied_skills
from models.skill_evidence_item import SkillEvidenceItem
from models.skill_source import SkillSource
from .utils import clean_text

logger = logging.getLogger(__name__)

# More recent experience/projects carry more weight as proof of *current*
# proficiency. Index 0 = most recent entry (resumes are assumed reverse
# chronological, which is the near-universal convention).
_RECENCY_WEIGHTS = (1.0, 0.85, 0.7, 0.55)


def _recency_weight(index: int) -> float:
    return _RECENCY_WEIGHTS[min(index, len(_RECENCY_WEIGHTS) - 1)]


class SkillGraphBuilder:
    """Stateless builder: `build()` is pure w.r.t. its input and safe to
    call concurrently from multiple requests."""

    def build(
        self, resume: ResumeProfile
    ) -> tuple[set[str], dict[str, list[SkillEvidenceItem]]]:
        evidence: dict[str, list[SkillEvidenceItem]] = defaultdict(list)

        self._ingest_declared_skills(resume, evidence)
        self._ingest_project_technologies(resume, evidence)
        self._ingest_experience_mentions(resume, evidence)
        self._ingest_inferred_skills(evidence)

        candidate_skills = set(evidence.keys())
        logger.debug("Built candidate skill graph with %d skills", len(candidate_skills))
        return candidate_skills, dict(evidence)

    # ------------------------------------------------------------------ #
    # Normalization
    # ------------------------------------------------------------------ #

    @staticmethod
    def normalize(raw_skill: str) -> str:
        return resolve_alias(clean_text(raw_skill))

    # ------------------------------------------------------------------ #
    # Ingestion stages
    # ------------------------------------------------------------------ #

    def _ingest_declared_skills(self, resume: ResumeProfile, evidence: dict) -> None:
        for raw in resume.technical_skills:
            skill = self.normalize(raw)
            if not skill:
                continue
            evidence[skill].append(
                SkillEvidenceItem(
                    skill=skill,
                    source=SkillSource.TECHNICAL_SKILLS,
                    context="Declared in technical skills list",
                    confidence=1.0,
                    recency_weight=1.0,
                )
            )

        for raw in resume.conceptual_skills:
            skill = self.normalize(raw)
            if not skill:
                continue
            evidence[skill].append(
                SkillEvidenceItem(
                    skill=skill,
                    source=SkillSource.CONCEPTUAL_SKILLS,
                    context="Declared in conceptual skills list",
                    confidence=0.95,
                    recency_weight=1.0,
                )
            )

    def _ingest_project_technologies(self, resume: ResumeProfile, evidence: dict) -> None:
        for idx, project in enumerate(resume.projects):
            recency = _recency_weight(idx)
            for raw in project.technologies:
                skill = self.normalize(raw)
                if not skill:
                    continue
                snippet = project.achievements[0] if project.achievements else None
                evidence[skill].append(
                    SkillEvidenceItem(
                        skill=skill,
                        source=SkillSource.PROJECT,
                        context=f"Used in project '{project.name}'",
                        snippet=snippet,
                        confidence=0.9,
                        recency_weight=recency,
                    )
                )

    def _ingest_experience_mentions(self, resume: ResumeProfile, evidence: dict) -> None:
        """Cross-reference already-known skills against free-text
        achievement bullets so each skill can be backed by a concrete,
        recency-weighted proof point rather than only a bare keyword."""
        known_skills = list(evidence.keys())
        if not known_skills:
            return

        for idx, exp in enumerate(resume.experience):
            recency = _recency_weight(idx)
            for achievement in exp.achievements:
                text = clean_text(achievement)
                for skill in known_skills:
                    if skill in text:
                        evidence[skill].append(
                            SkillEvidenceItem(
                                skill=skill,
                                source=SkillSource.EXPERIENCE,
                                context=f"{exp.role or 'Role'} at {exp.company}".strip(),
                                snippet=achievement,
                                confidence=0.85,
                                recency_weight=recency,
                            )
                        )

    def _ingest_inferred_skills(self, evidence: dict) -> None:
        """Add low-confidence inferred skills based on the hierarchy
        graph, without ever overwriting a directly-evidenced skill."""
        directly_known = list(evidence.keys())
        for skill in directly_known:
            for implied_skill, confidence in get_implied_skills(skill):
                if implied_skill in evidence:
                    continue  # already directly evidenced - no need to infer
                evidence[implied_skill].append(
                    SkillEvidenceItem(
                        skill=implied_skill,
                        source=SkillSource.INFERRED,
                        context=f"Inferred from demonstrated '{skill}' experience",
                        confidence=confidence,
                        recency_weight=0.5,
                    )
                )
