import re
from difflib import SequenceMatcher


class SkillNormalizer:

    SKILL_ALIASES = {

        # Java Ecosystem
        "java 8": "java",
        "java 11": "java",
        "java 17": "java",
        "core java": "java",
        "java programming": "java",

        # Spring
        "spring": "spring boot",
        "springboot": "spring boot",
        "spring framework": "spring boot",
        "spring mvc": "spring boot",

        # Databases
        "mongodb": "mongo db",
        "mongo": "mongo db",
        "oracle db": "oracle",
        "mysql database": "mysql",
        "postgres": "postgresql",

        # Cloud
        "amazon web services": "aws",
        "ec2": "aws",
        "s3": "aws",
        "eks": "aws",
        "lambda": "aws",

        # Messaging
        "apache kafka": "kafka",
        "rabbit mq": "rabbitmq",

        # Frontend
        "reactjs": "react",
        "react.js": "react",
        "nodejs": "node js",
        "node.js": "node js",

        # Containers
        "kubernetes": "k8s",
        "docker container": "docker",

        # Version Control
        "gitlab": "git",
        "github": "git",
        "bitbucket": "git",

        # Cache
        "redis cache": "redis",

        # Architecture
        "microservice": "microservices",
        "event driven": "event driven architecture",
        "event-driven": "event driven architecture",

        # Security
        "oauth": "oauth2",
        "oauth 2.0": "oauth2",
        "jwt token": "jwt"
    }

    KNOWN_SKILLS = {

        "java",
        "python",
        "c",
        "c++",
        "javascript",
        "typescript",

        "spring boot",
        "hibernate",
        "jpa",
        "maven",
        "gradle",

        "react",
        "angular",
        "vue",
        "node js",

        "kafka",
        "rabbitmq",

        "redis",
        "ehcache",
        "hazelcast",

        "mysql",
        "postgresql",
        "oracle",
        "mongo db",

        "aws",
        "azure",
        "gcp",

        "docker",
        "k8s",

        "git",
        "svn",

        "rest api",
        "graphql",

        "jwt",
        "oauth2",
        "spring security",

        "microservices",
        "system design",
        "concurrency",
        "multithreading",
        "event driven architecture",

        "ci/cd",
        "jenkins",
        "github actions",

        "linux",
        "unix",

        "llm",
        "ollama",
        "langchain",
        "rag",
        "vector database",
        "chromadb",
        "pinecone"
    }

    @classmethod
    def normalize(
        cls,
        skill: str
    ) -> str:

        if not skill:
            return ""

        skill = (
            skill.strip()
            .lower()
        )

        skill = re.sub(
            r"\s+",
            " ",
            skill
        )

        return cls.SKILL_ALIASES.get(
            skill,
            skill
        )

    @classmethod
    def normalize_skills(
        cls,
        skills
    ):

        normalized = set()

        for skill in skills:

            value = cls.normalize(
                skill
            )

            if value:
                normalized.add(
                    value
                )

        return sorted(
            normalized
        )

    @classmethod
    def extract_skills(
        cls,
        text: str
    ):

        if not text:
            return []

        text = text.lower()

        detected = set()

        for skill in cls.KNOWN_SKILLS:

            pattern = (
                r"\b"
                + re.escape(skill.lower())
                + r"\b"
            )

            if re.search(
                pattern,
                text
            ):
                detected.add(
                    skill
                )

        return sorted(
            detected
        )

    @classmethod
    def fuzzy_match(
        cls,
        skill: str,
        candidate_skills
    ) -> bool:

        if not skill:
            return False

        normalized_skill = (
            cls.normalize(
                skill
            )
        )

        for candidate in candidate_skills:

            normalized_candidate = (
                cls.normalize(
                    candidate
                )
            )

            if (
                normalized_skill
                ==
                normalized_candidate
            ):
                return True

            similarity = (
                SequenceMatcher(
                    None,
                    normalized_skill,
                    normalized_candidate
                ).ratio()
            )

            if similarity >= 0.90:
                return True

        return False

    @classmethod
    def skill_overlap(
        cls,
        source_skills,
        target_skills
    ):

        source = {
            cls.normalize(skill)
            for skill in source_skills
        }

        target = {
            cls.normalize(skill)
            for skill in target_skills
        }

        return source & target

    @classmethod
    def missing_skills(
        cls,
        candidate_skills,
        required_skills
    ):

        candidate = {
            cls.normalize(skill)
            for skill in candidate_skills
        }

        required = {
            cls.normalize(skill)
            for skill in required_skills
        }

        return sorted(
            required - candidate
        )

    @classmethod
    def match_percentage(
        cls,
        candidate_skills,
        required_skills
    ):

        required = {
            cls.normalize(skill)
            for skill in required_skills
        }

        if not required:
            return 100.0

        matched = len(
            cls.skill_overlap(
                candidate_skills,
                required_skills
            )
        )

        return round(
            (matched / len(required))
            * 100.0,
            2
        )

