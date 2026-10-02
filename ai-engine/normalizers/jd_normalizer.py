from models.jd_profile import JDProfile


class JDNormalizer:

    SKILL_MAPPING = {
        "java 8": "java",
        "java 11": "java",
        "java 17": "java",
        "java 21": "java",
        "spring": "spring boot",
        "springboot": "spring boot",
        "amazon web services": "aws",
        "aws cloud": "aws",
        "apache kafka": "kafka",
        "golang": "go",
        "ci/cd pipelines": "ci/cd"
    }

    SOFT_SKILL_MAPPING = {
        "team player": "collaboration",
        "teamwork": "collaboration",
        "mentor junior engineers": "mentoring",
        "guide junior engineers": "mentoring",
        "communication skills": "communication",
        "ownership mentality": "ownership",
        "problem solving skills": "problem solving"
    }

    @staticmethod
    def normalize(jd: JDProfile) -> JDProfile:

        jd.job_title = JDNormalizer._clean_text(jd.job_title)

        jd.company = JDNormalizer._clean_text(jd.company)

        jd.location = JDNormalizer._clean_text(jd.location)

        jd.work_setting = JDNormalizer._clean_text(jd.work_setting)

        jd.required_skills = JDNormalizer._normalize_skills(
            jd.required_skills
        )

        jd.preferred_skills = JDNormalizer._normalize_skills(
            jd.preferred_skills
        )

        jd.soft_skills = JDNormalizer._normalize_soft_skills(
            jd.soft_skills
        )

        jd.education_requirements = JDNormalizer._normalize_list(
            jd.education_requirements
        )

        return jd

    @staticmethod
    def _clean_text(value):

        if not value:
            return value

        return value.strip()

    @staticmethod
    def _normalize_skills(skills):

        if not skills:
            return []

        normalized = []

        for skill in skills:

            skill = skill.strip().lower()

            skill = JDNormalizer.SKILL_MAPPING.get(
                skill,
                skill
            )

            normalized.append(skill)

        return sorted(set(normalized))

    @staticmethod
    def _normalize_soft_skills(skills):

        if not skills:
            return []

        normalized = []

        for skill in skills:

            skill = skill.strip().lower()

            skill = JDNormalizer.SOFT_SKILL_MAPPING.get(
                skill,
                skill
            )

            normalized.append(skill)

        return sorted(set(normalized))

    @staticmethod
    def _normalize_list(values):

        if not values:
            return []

        normalized = []

        for value in values:

            value = value.strip()

            if value:
                normalized.append(value)

        return list(dict.fromkeys(normalized))