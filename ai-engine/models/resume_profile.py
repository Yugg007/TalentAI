from typing import List, Optional

from pydantic import BaseModel
from models.achievement import Achievement
from models.project import Project
from models.experience import Experience
from models.education import Education



class ResumeProfile(BaseModel):

    technical_skills: List[str] = []

    conceptual_skills: List[str] = []

    experience_years: float = 0.0

    resume_summary: str = ""

    certifications: List[str] = []

    project_domains: List[str] = []

    achievements: List[str] = []

    primary_languages: List[str] = []

    frameworks: List[str] = []

    cloud_platforms: List[str] = []

    databases: List[str] = []

    architecture_keywords: List[str] = []

    leadership_examples: List[str] = []

    quantified_achievements: List[Achievement] = []

    experience: List[Experience] = []

    projects: List[Project] = []

    education: List[Education] = []