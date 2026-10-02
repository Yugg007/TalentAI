"""
Generic, dependency-free text-processing helpers used throughout the
skill_gap package. Kept free of any domain knowledge (no skill lists,
no aliases) so they stay trivially unit-testable.
"""

from __future__ import annotations

import re
import unicodedata
from difflib import SequenceMatcher
from functools import lru_cache
from typing import Iterable, Optional, Tuple

_WHITESPACE_RE = re.compile(r"\s+")
# Keep alnum, whitespace, and characters meaningful to tech skill tokens
# (C++, CI/CD, Node.js, OAuth2.0, ASP.NET-style hyphens).
_PUNCT_RE = re.compile(r"[^\w\s+./#-]")

DEFAULT_FUZZY_THRESHOLD = 0.86


@lru_cache(maxsize=8192)
def clean_text(text: str) -> str:
    """Lowercase, unicode-normalize, strip punctuation noise, and collapse
    whitespace so that superficially different strings ("C++", "c ++ ",
    "C++.") converge on a stable canonical form."""
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKC", text)
    normalized = normalized.strip().lower()
    normalized = _PUNCT_RE.sub("", normalized)
    normalized = _WHITESPACE_RE.sub(" ", normalized)
    return normalized.strip()


def similarity(a: str, b: str) -> float:
    """Character-level similarity ratio in [0.0, 1.0]."""
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def best_fuzzy_match(
    target: str,
    candidates: Iterable[str],
    threshold: float = DEFAULT_FUZZY_THRESHOLD,
) -> Tuple[Optional[str], float]:
    """Return the best-scoring candidate for `target` if it clears
    `threshold`, else (None, 0.0). Deterministic tie-break: first
    highest-scoring candidate in iteration order wins."""
    best_candidate: Optional[str] = None
    best_score = 0.0
    for candidate in candidates:
        score = similarity(target, candidate)
        if score > best_score:
            best_score = score
            best_candidate = candidate
    if best_candidate is not None and best_score >= threshold:
        return best_candidate, best_score
    return None, 0.0


_METRIC_PATTERN = re.compile(
    r"""
    (?:
        \d+(?:\.\d+)?\s?%                      # 96%
        | \d+(?:\.\d+)?\s?[xX]\b                # 3x
        | <\s?\d+(?:\.\d+)?\s?(?:ms|s|sec|seconds|min|minutes)\b   # <100ms
        | \d+(?:\.\d+)?\s?(?:ms|s|sec|seconds|min|minutes)\b       # 10s
        | \d+(?:\.\d+)?\s?(?:days?|hours?|hrs?)\b                  # 2 days
    )
    """,
    re.VERBOSE,
)


def extract_metrics(text: str) -> list[str]:
    """Pull quantifiable, resume-style achievement metrics out of free
    text, e.g. '96%', '<100ms', '12 days to 2 days' -> ['12 days', '2
    days']. Used to back "candidate strength" claims with hard numbers."""
    if not text:
        return []
    return _METRIC_PATTERN.findall(text)
