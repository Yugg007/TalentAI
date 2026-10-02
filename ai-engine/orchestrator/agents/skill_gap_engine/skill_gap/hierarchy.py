"""
Lightweight skill taxonomy used to make matching smarter than pure
set-intersection:

  * SKILL_CATEGORY_MAP  - coarse category per skill, for reporting/UX.
  * TRANSFERABLE_GROUPS - skills that substitute for one another well
    enough that missing one, while knowing another in the group, is a
    "fast to close" gap rather than a cold gap.
  * IMPLIED_SKILLS      - composite/advanced skills that give partial,
    low-confidence evidence of a more fundamental skill (e.g. shipping
    Spring Boot services implies real Java proficiency) even if the
    fundamental skill wasn't listed explicitly.

This is intentionally a small, hand-curated seed set for the backend/
platform engineering domain reflected in the sample data. Extend the
dictionaries below as the product covers more job families - there is
no code change required elsewhere to add new entries.
"""

from __future__ import annotations

from enum import Enum


class SkillCategory(str, Enum):
    LANGUAGE = "language"
    FRAMEWORK = "framework"
    DATABASE = "database"
    CACHING = "caching"
    MESSAGING = "messaging"
    CLOUD = "cloud"
    DEVOPS = "devops"
    ARCHITECTURE = "architecture"
    SECURITY = "security"
    CONCEPT = "concept"
    OTHER = "other"


SKILL_CATEGORY_MAP: dict[str, SkillCategory] = {
    "java": SkillCategory.LANGUAGE,
    "python": SkillCategory.LANGUAGE,
    "go": SkillCategory.LANGUAGE,
    "c++": SkillCategory.LANGUAGE,
    "javascript": SkillCategory.LANGUAGE,
    "typescript": SkillCategory.LANGUAGE,
    "spring boot": SkillCategory.FRAMEWORK,
    "django": SkillCategory.FRAMEWORK,
    "express": SkillCategory.FRAMEWORK,
    "mysql": SkillCategory.DATABASE,
    "postgresql": SkillCategory.DATABASE,
    "mongodb": SkillCategory.DATABASE,
    "redis": SkillCategory.CACHING,
    "distributed caching": SkillCategory.CACHING,
    "kafka": SkillCategory.MESSAGING,
    "rabbitmq": SkillCategory.MESSAGING,
    "aws": SkillCategory.CLOUD,
    "google cloud platform": SkillCategory.CLOUD,
    "azure": SkillCategory.CLOUD,
    "docker": SkillCategory.DEVOPS,
    "kubernetes": SkillCategory.DEVOPS,
    "ci/cd": SkillCategory.DEVOPS,
    "microservices": SkillCategory.ARCHITECTURE,
    "event-driven architecture": SkillCategory.ARCHITECTURE,
    "system design": SkillCategory.ARCHITECTURE,
    "oauth2": SkillCategory.SECURITY,
    "jwt": SkillCategory.SECURITY,
    "concurrency": SkillCategory.CONCEPT,
}

# Skills that group together for "transferable experience" purposes. If a
# candidate knows any skill in a group, a JD skill within the same group
# is treated as a fast-track / learnable gap rather than a cold gap. Never
# treated as a hard requirement match - see matcher.py.
TRANSFERABLE_GROUPS: list[set[str]] = [
    {"java", "python", "go", "c++", "javascript", "typescript"},   # backend languages
    {"mysql", "postgresql", "mongodb"},                             # persistence stores
    {"redis", "distributed caching"},                               # caching
    {"kafka", "rabbitmq"},                                          # messaging
    {"aws", "google cloud platform", "azure"},                      # cloud providers
    {"docker", "kubernetes"},                                       # containerization
    {"spring boot", "django", "express"},                           # backend frameworks
    {"oauth2", "jwt"},                                              # authn/authz
]

# skill -> [(implied_skill, confidence), ...]
# Composite/advanced skills imply partial exposure to a more fundamental
# skill even when that fundamental skill wasn't declared explicitly.
IMPLIED_SKILLS: dict[str, list[tuple[str, float]]] = {
    "kafka": [("event-driven architecture", 0.7), ("distributed caching", 0.2)],
    "microservices": [("system design", 0.6), ("event-driven architecture", 0.4)],
    "spring boot": [("java", 0.9)],
    "redis": [("distributed caching", 0.6)],
    "docker": [("ci/cd", 0.3)],
}


def get_category(skill: str) -> SkillCategory:
    return SKILL_CATEGORY_MAP.get(skill, SkillCategory.OTHER)


def find_transferable_group(skill: str) -> set[str] | None:
    for group in TRANSFERABLE_GROUPS:
        if skill in group:
            return group
    return None


def get_implied_skills(skill: str) -> list[tuple[str, float]]:
    return IMPLIED_SKILLS.get(skill, [])
