from typing import List, Optional

from pydantic import BaseModel

class Achievement(BaseModel):
    achievement: str
    metric: Optional[str] = None