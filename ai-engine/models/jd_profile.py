from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class JDProfile(BaseModel):
    # --- Basic Info ---
    job_title: str = Field(..., min_length=1)
    company: Optional[str] = None
    location: Optional[str] = None
    work_setting: Optional[str] = None

    # --- Experience Metrics ---
    minimum_experience: Optional[float] = None
    preferred_experience: Optional[float] = None

    # --- Skills & Requirements (Initialized cleanly via Field) ---
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    education_requirements: List[str] = Field(default_factory=list)

    # --- Compensation ---
    salary_currency: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None

    @field_validator(
        "required_skills",
        "preferred_skills",
        "soft_skills",
        "education_requirements",
        mode="before"
    )
    @classmethod
    def validate_lists(cls, value):
        if value in (None, ""):
            return []
        
        # Coerce a single string into a list seamlessly
        if isinstance(value, str):
            return [s.strip() for s in value.split(",") if s.strip()]
            
        if not isinstance(value, list):
            raise ValueError("Must be a list or a comma-separated string")
            
        return value

    @field_validator(
        "minimum_experience",
        "preferred_experience",
        "salary_min",
        "salary_max",
        mode="before"
    )
    @classmethod
    def validate_numbers(cls, value):
        # Empty space strings or explicit Nones are normalized to None
        if value in (None, ""):
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            raise ValueError(f"Could not convert {value} to a valid number")