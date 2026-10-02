
from pydantic import BaseModel
from typing import List
from pydantic import Field

class CandidateStrength(BaseModel):
    skill: str
    description: str
    supporting_metrics: List[str] = Field(default_factory=list)
    weight: float = 1.0
