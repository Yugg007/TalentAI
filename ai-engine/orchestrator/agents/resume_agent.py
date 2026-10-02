import logging


from services.llm_service import llm_service
from utils.skill_normalizer import SkillNormalizer
from models.resume_profile import ResumeProfile
from normalizers.resume_normalizer import ResumeNormalizer
from orchestrator.processor.llm_response_processor import safe_process_pipeline_response

logger = logging.getLogger(__name__)


class ResumeAgent:

    def analyze(self, resume_text: str) -> dict:

        prompt = f"""
You are an ATS Resume Parser.

Extract ONLY factual information from the resume and provide response in json strictly as per schema given below.

Note - Just return the JSON, do not add any extra text or explanation.

Rules:

You are an ATS Resume Parser.

Extract ONLY factual information from the resume and provide response in json strictly as per schema given below.

Note - Just return the JSON, do not add any extra text or explanation.

Rules:

1. technical_skills:
   Languages, frameworks, databases,
   cloud platforms, tools,
   messaging systems and technologies explicitly mentioned in the resume.

2. conceptual_skills:
   Concepts, methodologies,
   architecture patterns,
   software engineering principles and design patterns explicitly mentioned.

3. experience_years:
   Calculate total professional experience in years.

4. achievements:
   Maximum 120 characters each.

5. project achievements:
   Summarize in one sentence.

6. resume_summary:
   Generate a concise 3-5 sentence professional summary based ONLY on the resume.
   Include years of experience, primary domain, major technologies, and strongest expertise.
   Do NOT invent information.

7. education:
   Extract only degree names from the education section.
   Example:
   [
     "B.Tech in Computer Science",
     "M.Tech in Software Engineering"
   ]

8. certifications:
   Extract certification names only.
   Return [] if none.

9. project_domains:
   Identify business domains of the projects.
   Examples:
   Banking
   Insurance
   Healthcare
   FinTech
   E-commerce
   EdTech
   Travel
   Logistics
   HRTech
   Social Media

10. achievements:
    Extract resume-level achievements such as awards, promotions, rankings,
    open source contributions, publications, hackathons or measurable accomplishments.
    Maximum 120 characters each.

11. primary_languages:
    Return only programming languages explicitly mentioned.

12. frameworks:
    Return application frameworks and libraries explicitly mentioned.

13. cloud_platforms:
    Return cloud providers and managed cloud services explicitly mentioned.

14. databases:
    Return relational and NoSQL databases explicitly mentioned.

15. architecture_keywords:
    Extract architecture and system design related keywords explicitly mentioned.
    Examples:
    Microservices
    Distributed Systems
    Event Driven Architecture
    REST APIs
    Message Queues
    CQRS
    Saga
    Domain Driven Design
    Clean Architecture
    Hexagonal Architecture
    MVC
    Layered Architecture
    API Gateway
    Service Discovery
    Containerization
    Kubernetes
    Docker
    High Availability
    Scalability
    Fault Tolerance
    Caching
    Load Balancing
    Event Streaming

16. leadership_examples:
    Extract concise examples where the candidate demonstrated leadership,
    ownership, mentoring, project ownership, technical decision making,
    cross-team collaboration or stakeholder communication.
    Return [] if none.

17. quantified_achievements:
    Extract achievements containing measurable impact such as percentages,
    latency improvements, throughput improvements, cost savings,
    revenue impact, scale, user counts or performance metrics.
    Preserve numbers whenever available.
    Return [] if none.

18. Do NOT invent data.

19. If a field is unavailable, return an empty list or empty string as appropriate.

20. Return JSON only.

Schema:

{{
  "technical_skills": [],
  "conceptual_skills": [],
  "experience_years": 0.0,
  "resume_summary": "",
  "education": [
    {{
      "institution": "",
      "degree": "",
      "duration": ""
    }}
  ],
  "certifications": [],
  "project_domains": [],
  "achievements": [],
  "primary_languages": [],
  "frameworks": [],
  "cloud_platforms": [],
  "databases": [],
  "architecture_keywords": [],
  "leadership_examples": [],
  "quantified_achievements": [],
  "experience": [
    {{
      "company": "",
      "role": "",
      "duration": "",
      "achievements": []
    }}
  ],
  "projects": [
    {{
      "name": "",
      "duration": "",
      "technologies": [],
      "achievements": []
    }}
  ]
}}

# {{
#   "technical_skills": [],
#   "conceptual_skills": [],
#   "experience_years": 0.0,
#   "experience": [
#     {{
#       "company": "",
#       "role": "",
#       "duration": "",
#       "achievements": []
#     }}
#   ],
#   "projects": [
#     {{
#       "name": "",
#       "duration": "",
#       "technologies": [],
#       "achievements": []
#     }}
#   ],
#   "education": [
#     {{
#       "institution": "",
#       "degree": "",
#       "duration": ""
#     }}
#   ]
# }}

Resume:

{resume_text}
"""

        response = llm_service.resume(prompt)

        try:
            resume = safe_process_pipeline_response(
                response, 
                model_cls=ResumeProfile,
                normalizer=ResumeNormalizer
            )
            return resume.model_dump()

        except Exception as ex:

            logger.exception(
                "Failed to validate Resume response"
            )

            raise

    def _normalize(self, data: dict) -> dict:

        technical_skills = {
            SkillNormalizer.normalize(skill)
            for skill in data.get(
                "technical_skills",
                []
            )
            if skill
        }

        for project in data.get(
            "projects",
            []
        ):

            for tech in project.get(
                "technologies",
                []
            ):

                technical_skills.add(
                    SkillNormalizer.normalize(
                        tech
                    )
                )

        for exp in data.get(
            "experience",
            []
        ):

            for achievement in exp.get(
                "achievements",
                []
            ):

                detected_skills = (
                    SkillNormalizer.extract_skills(
                        achievement
                    )
                )

                for skill in detected_skills:

                    technical_skills.add(
                        SkillNormalizer.normalize(
                            skill
                        )
                    )

        conceptual_skills = sorted(
            {
                skill.strip()
                for skill in data.get(
                    "conceptual_skills",
                    []
                )
                if skill
            }
        )

        data["technical_skills"] = sorted(
            technical_skills
        )

        data["conceptual_skills"] = conceptual_skills

        return data


resume_agent = ResumeAgent()