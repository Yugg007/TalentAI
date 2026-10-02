import logging

from services.llm_service import llm_service
from orchestrator.processor.jd_processor import process_jd_response
from utils.skill_normalizer import SkillNormalizer
from orchestrator.processor.llm_response_processor import safe_process_pipeline_response
from models.jd_profile import JDProfile
from normalizers.jd_normalizer import JDNormalizer


logger = logging.getLogger(__name__)


class JDAgent:

    def analyze(self, jd_text: str) -> dict:

        prompt = f"""
You are an ATS Job Description Parser.

Extract ONLY information explicitly stated
or strongly implied in the Job Description and provide response in json strictly as per schema given below.

Note - Just return the JSON, do not add any extra text or explanation.

Rules:

1. required_skills:
   Core technologies that are mandatory.

2. preferred_skills:
   Nice-to-have technologies.

3. soft_skills:
   Communication,
   Leadership,
   Mentoring,
   Agile,
   Collaboration.

4. minimum_experience:
   Lowest years required.

5. preferred_experience:
   Upper bound if range exists.

Examples:

3-5 years
minimum_experience = 3
preferred_experience = 5

5+ years
minimum_experience = 5
preferred_experience = 5

Return JSON only.

Schema:

{{
    "job_title": "",
    "company": "",
    "location": "",
    "work_setting": "",

    "minimum_experience": 0.0,
    "preferred_experience": 0.0,

    "required_skills": [],
    "preferred_skills": [],
    "soft_skills": [],

    "education_requirements": [],

    "salary_currency": "",
    "salary_min": null,
    "salary_max": null
}}

Job Description:

{jd_text}
"""

        response = llm_service.job_description(
            prompt
        )

        try:

            jd = safe_process_pipeline_response(
                response,
                model_cls=JDProfile,
                normalizer=JDNormalizer
            )

            return jd.model_dump()

        except Exception as ex:

            logger.exception(
                "Failed to validate JD response"
            )

            raise

    def _normalize(
        self,
        data: dict
    ) -> dict:

        required_skills = {
            SkillNormalizer.normalize(skill)
            for skill in data.get(
                "required_skills",
                []
            )
            if skill and len(skill.strip()) > 1
        }

        preferred_skills = {
            SkillNormalizer.normalize(skill)
            for skill in data.get(
                "preferred_skills",
                []
            )
            if skill and len(skill.strip()) > 1
        }

        preferred_skills = (
            preferred_skills
            - required_skills
        )

        data["required_skills"] = sorted(
            required_skills
        )

        data["preferred_skills"] = sorted(
            preferred_skills
        )

        data["soft_skills"] = sorted(
            {
                skill.strip()
                for skill in data.get(
                    "soft_skills",
                    []
                )
                if skill
            }
        )

        minimum_exp = data.get(
            "minimum_experience",
            0.0
        )

        preferred_exp = data.get(
            "preferred_experience"
        )

        if preferred_exp is None:
            preferred_exp = minimum_exp

        data["minimum_experience"] = float(
            minimum_exp
        )

        data["preferred_experience"] = float(
            preferred_exp
        )

        work_setting = (
            data.get(
                "work_setting"
            )
            or ""
        ).strip().lower()

        work_setting_mapping = {
            "work from home": "remote",
            "wfh": "remote",
            "onsite": "on-site",
            "office": "on-site"
        }

        data["work_setting"] = (
            work_setting_mapping.get(
                work_setting,
                work_setting
            )
        )

        education_requirements = []
        seen = set()

        for education in data.get(
            "education_requirements",
            []
        ):

            if not education:
                continue

            normalized = (
                education.strip()
                .lower()
            )

            if normalized not in seen:

                seen.add(
                    normalized
                )

                education_requirements.append(
                    education.strip()
                )

        data[
            "education_requirements"
        ] = education_requirements

        salary_min = data.get(
            "salary_min"
        )

        salary_max = data.get(
            "salary_max"
        )

        if salary_min in ["", "null"]:
            data["salary_min"] = None

        if salary_max in ["", "null"]:
            data["salary_max"] = None

        return data


jd_agent = JDAgent()