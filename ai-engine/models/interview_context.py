from typing import List

from pydantic import BaseModel, Field

from models.achievement import Achievement
from models.resume_profile import ResumeProfile
from models.jd_profile import JDProfile
from models.project import Project

# pyright: reportInvalidTypeForm=false
class InterviewContext(BaseModel):
    """
    Context passed to the Interview Question Generator LLM.

    This object contains only the information required to generate
    high-quality, role-specific interview questions while keeping
    prompt size minimal.
    """

    # ----------------------------------------------------------
    # 1. Pipeline Analysis & Normal Collections (Derived Metadata)
    # ----------------------------------------------------------
    experience_years: float
    ats_score: float
    interview_difficulty: str

    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    transferable_skills: List[str] = Field(default_factory=list)

    validate_skills: List[str] = Field(default_factory=list)
    probe_skills: List[str] = Field(default_factory=list)
    candidate_strengths: List[str] = Field(default_factory=list)

    focus_projects: List[Project] = Field(default_factory=list)
    experience_highlights: List[str] = Field(default_factory=list)

    # ----------------------------------------------------------
    # 2. Job Description (JD) Mirror Fields
    # ----------------------------------------------------------
    target_role: JDProfile.__annotations__['job_title'] # type: ignore
    company: JDProfile.__annotations__['company']
    required_skills: JDProfile.__annotations__['required_skills'] = Field(default_factory=list)
    preferred_skills: JDProfile.__annotations__['preferred_skills'] = Field(default_factory=list)

    # ----------------------------------------------------------
    # 3. Resume Mirror Fields (Dynamically Type-Casted)
    # ----------------------------------------------------------
    resume_summary: ResumeProfile.__annotations__['resume_summary']
    
    # Changed from str to List[str] to support [edu.degree for edu in resume.education]
    education: List[str] = Field(default_factory=list)

    certifications: ResumeProfile.__annotations__['certifications'] = Field(default_factory=list)
    project_domains: ResumeProfile.__annotations__['project_domains'] = Field(default_factory=list)
    achievements: ResumeProfile.__annotations__['achievements'] = Field(default_factory=list)
    primary_languages: ResumeProfile.__annotations__['primary_languages'] = Field(default_factory=list)
    frameworks: ResumeProfile.__annotations__['frameworks'] = Field(default_factory=list)
    cloud_platforms: ResumeProfile.__annotations__['cloud_platforms'] = Field(default_factory=list)
    databases: ResumeProfile.__annotations__['databases'] = Field(default_factory=list)
    architecture_keywords: ResumeProfile.__annotations__['architecture_keywords'] = Field(default_factory=list)
    leadership_examples: ResumeProfile.__annotations__['leadership_examples'] = Field(default_factory=list)
    quantified_achievements: ResumeProfile.__annotations__['quantified_achievements'] = Field(default_factory=list)