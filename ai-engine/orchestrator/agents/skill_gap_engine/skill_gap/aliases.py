"""
Canonical skill alias registry.

Maps common variants, abbreviations, and colloquial spellings of a skill
to a single canonical form so downstream matching (JD <-> resume) is not
defeated by superficial string differences (e.g. "golang" vs "go",
"k8s" vs "kubernetes", "postgres" vs "postgresql").

Keys and values here should already be lowercase/clean-text-normalized
(no punctuation beyond what `utils.clean_text` preserves) - `resolve_alias`
is called *after* `clean_text`, never before.
"""

from __future__ import annotations

SKILL_ALIASES: dict[str, str] = {
    # Languages
    "golang": "go",
    "go lang": "go",
    "js": "javascript",
    "ecmascript": "javascript",
    "node": "nodejs",
    "node.js": "nodejs",
    "ts": "typescript",
    "py": "python",
    "python3": "python",
    "c plus plus": "c++",
    "cpp": "c++",
    "postgres": "postgresql",
    "postgre": "postgresql",
    "psql": "postgresql",
    "mongo": "mongodb",
    "mongo db": "mongodb",

    # Cloud / infra
    "amazon web services": "aws",
    "aws cloud": "aws",
    "gcp": "google cloud platform",
    "google cloud": "google cloud platform",
    "azure cloud": "azure",
    "k8s": "kubernetes",
    "docker containers": "docker",
    "ci-cd": "ci/cd",
    "cicd": "ci/cd",
    "ci cd": "ci/cd",
    "continuous integration": "ci/cd",
    "continuous deployment": "ci/cd",
    "continuous delivery": "ci/cd",

    # Messaging / streaming
    "apache kafka": "kafka",
    "kafka streams": "kafka",
    "rabbit mq": "rabbitmq",
    "amqp": "rabbitmq",

    # Frameworks
    "springboot": "spring boot",
    "spring-boot": "spring boot",
    "spring framework": "spring boot",
    "express js": "express",
    "expressjs": "express",
    "django rest framework": "django",
    "drf": "django",

    # Architecture / concepts
    "microservice": "microservices",
    "micro-services": "microservices",
    "micro services": "microservices",
    "event driven architecture": "event-driven architecture",
    "event-driven": "event-driven architecture",
    "eda": "event-driven architecture",
    "distributed cache": "distributed caching",
    "distributed-caching": "distributed caching",
    "system-design": "system design",
    "sys design": "system design",
    "concurrent programming": "concurrency",
    "multithreading": "concurrency",
    "multi-threading": "concurrency",
    "oauth 2.0": "oauth2",
    "oauth2.0": "oauth2",
    "oauth": "oauth2",
    "json web token": "jwt",
    "json web tokens": "jwt",

    # Caching
    "redis cache": "redis",
    "redis geoindexing": "redis",
    "redis geo-indexing": "redis",

    # Serialization / RPC
    "protobuf": "protocol buffers",
    "protocol buffers protobuf": "protocol buffers",
    "grpc": "grpc",
}


def resolve_alias(token: str) -> str:
    """Return the canonical form for `token` if a known alias exists,
    otherwise return `token` unchanged."""
    return SKILL_ALIASES.get(token, token)
