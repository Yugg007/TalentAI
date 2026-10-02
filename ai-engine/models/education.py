from typing import Optional
from pydantic import BaseModel

class Education(BaseModel):
    institution: str
    degree: Optional[str] = None
    duration: Optional[str] = None

