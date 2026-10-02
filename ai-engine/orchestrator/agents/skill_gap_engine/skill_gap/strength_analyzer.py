"""
Surfaces the candidate's strongest, most defensible talking points:
matched skills backed by real, quantified achievements rather than just a
bare keyword sitting in a skills list.
"""

from __future__ import annotations

from models.resume_profile import ResumeProfile
from models.skill_evidence_item import SkillEvidenceItem
from models.candidate_strength import CandidateStrength
from .utils import extract_metrics

_DIRECT_PROOF_SOURCES = {"experience", "project"}


class StrengthAnalyzer:
    def identify(
        self,
        resume: ResumeProfile,
        matched_skills: set[str],
        evidence: dict[str, list[SkillEvidenceItem]],
    ) -> list[CandidateStrength]:
        strengths: list[CandidateStrength] = []

        for skill in sorted(matched_skills):
            items = evidence.get(skill, [])
            if not items:
                continue

            metrics: list[str] = []
            for item in items:
                if item.snippet:
                    metrics.extend(extract_metrics(item.snippet))

            has_direct_proof = any(item.source.value in _DIRECT_PROOF_SOURCES for item in items)
            if not (has_direct_proof or metrics):
                continue  # skill is only a bare declared keyword - not a "strength" to sell

            strengths.append(
                CandidateStrength(
                    skill=skill,
                    description=self._describe(skill, items, metrics),
                    supporting_metrics=sorted(set(metrics)),
                    weight=round(min(1.0, 0.5 + 0.1 * len(metrics)), 2),
                )
            )

        strengths.sort(key=lambda s: (len(s.supporting_metrics), s.weight), reverse=True)
        return strengths

    @staticmethod
    def _describe(skill: str, items: list[SkillEvidenceItem], metrics: list[str]) -> str:
        # Prefer a concrete experience/project context over a bare
        # "declared in skills list" line - the former is what actually
        # makes a compelling talking point.
        direct_contexts = sorted(
            {item.context for item in items if item.source.value in _DIRECT_PROOF_SOURCES}
        )
        any_contexts = sorted(
            {item.context for item in items if item.source.value != "inferred"}
        )
        context = direct_contexts[0] if direct_contexts else (any_contexts[0] if any_contexts else None)

        if metrics and context:
            return (
                f"Demonstrated production impact with {skill} "
                f"({', '.join(metrics[:3])}) via {context}"
            )
        if context:
            return f"Hands-on experience with {skill} via {context}"
        return f"Declared proficiency with {skill}"
