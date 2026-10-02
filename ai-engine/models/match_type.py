
from enum import Enum


class MatchType(str, Enum):
    EXACT = "exact"
    FUZZY = "fuzzy"
    HIERARCHICAL = "hierarchical"