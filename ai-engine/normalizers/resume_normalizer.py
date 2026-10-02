from models.resume_profile import ResumeProfile


class ResumeNormalizer:

    SKILL_MAPPING = {

        "java 8": "java",
        "java 11": "java",
        "java 17": "java",
        "java 21": "java",

        "spring": "spring boot",
        "springboot": "spring boot",

        "apache kafka": "kafka",

        "amazon web services": "aws",
        "aws cloud": "aws",

        "postgres": "postgresql",

        "event driven architecture":
            "event-driven architecture",

        "distributed cache":
            "distributed caching"
    }

    @staticmethod
    def normalize(
        resume: ResumeProfile
    ) -> ResumeProfile:

        resume.technical_skills = (
            ResumeNormalizer._normalize_skills(
                resume.technical_skills
            )
        )

        resume.conceptual_skills = (
            ResumeNormalizer._normalize_skills(
                resume.conceptual_skills
            )
        )

        for exp in resume.experience:

            exp.company = (
                ResumeNormalizer._clean(
                    exp.company
                )
            )

            exp.role = (
                ResumeNormalizer._clean(
                    exp.role
                )
            )

            exp.achievements = (
                ResumeNormalizer._normalize_list(
                    exp.achievements
                )
            )

        for project in resume.projects:

            project.name = (
                ResumeNormalizer._clean(
                    project.name
                )
            )

            project.technologies = (
                ResumeNormalizer._normalize_skills(
                    project.technologies
                )
            )

            project.achievements = (
                ResumeNormalizer._normalize_list(
                    project.achievements
                )
            )

        return resume

    @staticmethod
    def _normalize_skills(skills):

        if not skills:
            return []

        normalized = []

        for skill in skills:

            skill = skill.strip().lower()

            skill = (
                ResumeNormalizer.SKILL_MAPPING.get(
                    skill,
                    skill
                )
            )

            normalized.append(skill)

        return sorted(set(normalized))

    @staticmethod
    def _normalize_list(values):

        if not values:
            return []

        cleaned = []

        for value in values:

            value = value.strip()

            if value:
                cleaned.append(value)

        return list(dict.fromkeys(cleaned))

    @staticmethod
    def _clean(value):

        if not value:
            return value

        return value.strip()