from typing import List, Optional
from pydantic import BaseModel

class Project(BaseModel):
    name: str
    technologies: List[str] = []
    interview_topics: List[str] = []
    achievements: List[str] = []
    duration: Optional[str] = None
    technologies: List[str] = []
    achievements: List[str] = []

