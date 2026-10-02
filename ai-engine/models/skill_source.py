from enum import Enum

class SkillSource(str, Enum):
    TECHNICAL_SKILLS = "technical_skills"
    CONCEPTUAL_SKILLS = "conceptual_skills"
    EXPERIENCE = "experience"
    PROJECT = "project"
    INFERRED = "inferred"