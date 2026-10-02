from dataclasses import dataclass
from typing import Optional


@dataclass
class PipelineContext:

    task: dict

    resume_profile: Optional[dict] = None

    jd_profile: Optional[dict] = None

    skill_gap: Optional[dict] = None

    ats_result: Optional[dict] = None

    ats_score: Optional[dict] = None

    interview_questions: Optional[dict] = None