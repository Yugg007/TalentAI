"""
Post-processes the raw evidence collected during graph building.

`SkillGraphBuilder` intentionally over-collects (every matching bullet,
every project mention) so nothing is lost upstream. `EvidenceBuilder` is
where that raw trail gets turned into something worth putting in a report:
deduplicated, ranked by how compelling it is, and capped so the output
stays readable instead of dumping every bullet point on the resume.
"""

from __future__ import annotations

from models.skill_evidence_item import SkillEvidenceItem

MAX_EVIDENCE_PER_SKILL = 3


class EvidenceBuilder:
    def refine(
        self, raw_evidence: dict[str, list[SkillEvidenceItem]]
    ) -> dict[str, list[SkillEvidenceItem]]:
        refined: dict[str, list[SkillEvidenceItem]] = {}
        for skill, items in raw_evidence.items():
            deduped = self._dedupe(items)
            ranked = sorted(
                deduped,
                key=lambda item: item.confidence * item.recency_weight,
                reverse=True,
            )
            refined[skill] = ranked[:MAX_EVIDENCE_PER_SKILL]
        return refined

    @staticmethod
    def _dedupe(items: list[SkillEvidenceItem]) -> list[SkillEvidenceItem]:
        seen: set[tuple] = set()
        unique: list[SkillEvidenceItem] = []
        for item in items:
            key = (item.source, item.context, item.snippet)
            if key in seen:
                continue
            seen.add(key)
            unique.append(item)
        return unique
