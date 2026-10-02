from typing import List, Optional
from pydantic import BaseModel

class Experience(BaseModel):
    company: str
    role: Optional[str] = None
    duration: Optional[str] = None
    achievements: List[str] = []

