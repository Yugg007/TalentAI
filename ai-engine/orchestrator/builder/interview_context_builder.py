from typing import List

from models.resume_profile import ResumeProfile
from models.jd_profile import JDProfile

from models.ats_result import (
    AtsResult
)

from models.interview_context import (
    InterviewContext
)

from models.project import (
    Project,
)


class InterviewContextBuilder:

    def build(
        self,
        resume: ResumeProfile,
        jd: JDProfile,
        ats: AtsResult,
    ) -> InterviewContext:
        
        # print("Resume Profile: ", resume)

        matched_skills = list(
            dict.fromkeys(
                ats.matched_required_skills +
                ats.matched_preferred_skills
            )
        )

        missing_skills = list(
            dict.fromkeys(
                ats.missing_required_skills +
                ats.missing_preferred_skills
            )
        )

        transferable_skills = list(
            dict.fromkeys(
                skill
                for recommendation in ats.recommendations
                for skill in recommendation.transferable_from
            )
        )
        
        return InterviewContext(
            # --- Derived / Normal Collections ---
            experience_years=resume.experience_years,
            ats_score=ats.overall_fit_score,
            interview_difficulty=self._difficulty(ats.overall_fit_score),
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            transferable_skills=transferable_skills,
            validate_skills=self._validate_skills(ats),
            probe_skills=ats.missing_required_skills,
            candidate_strengths=self._candidate_strengths(ats),
            focus_projects=self._projects(resume),
            experience_highlights=self._experience(resume),

            # --- JD Mapped ---
            target_role=jd.job_title,
            company=jd.company,
            required_skills=jd.required_skills,
            preferred_skills=jd.preferred_skills,

            # --- Resume Mapped ---
            resume_summary=resume.resume_summary,
            education=[edu.degree for edu in resume.education if edu.degree],
            certifications=resume.certifications,
            project_domains=resume.project_domains,
            achievements=resume.achievements,
            primary_languages=resume.primary_languages,
            frameworks=resume.frameworks,
            cloud_platforms=resume.cloud_platforms,
            databases=resume.databases,
            architecture_keywords=resume.architecture_keywords,
            leadership_examples=resume.leadership_examples,
            quantified_achievements=resume.quantified_achievements,
        )
        # try:
        #     return InterviewContext(
        #         target_role=jd.job_title,
        #         company=jd.company,
        #         experience_years=resume.experience_years,
        #         ats_score=ats.overall_fit_score,
        #         interview_difficulty=self._difficulty(ats.overall_fit_score),

        #         required_skills=jd.required_skills,
        #         preferred_skills=jd.preferred_skills,

        #         matched_skills=matched_skills,
        #         missing_skills=missing_skills,
        #         transferable_skills=transferable_skills,

        #         validate_skills=self._validate_skills(
        #             ats
        #         ),
        #         probe_skills=ats.missing_required_skills,

        #         candidate_strengths=self._candidate_strengths(ats),

        #         focus_projects=self._projects(resume),

        #         experience_highlights=self._experience(resume),

        #         # ----------------------------
        #         # Resume Analysis
        #         # ----------------------------

        #         resume_summary=resume.resume_summary,

        #         education=[
        #             edu.degree
        #             for edu in resume.education
        #             if edu.degree
        #         ],

        #         certifications=resume.certifications,

        #         project_domains=resume.project_domains,

        #         achievements=resume.achievements,

        #         primary_languages=resume.primary_languages,

        #         frameworks=resume.frameworks,

        #         cloud_platforms=resume.cloud_platforms,

        #         databases=resume.databases,

        #         architecture_keywords=resume.architecture_keywords,

        #         leadership_examples=resume.leadership_examples,

        #         quantified_achievements=resume.quantified_achievements,
        #     )
        # except Exception as e:
        #     print("Error building InterviewContext: ", e)
        #     raise  # or return a fallback / None depending on your architecture

        # return InterviewContext(

        #     target_role=jd.job_title,

        #     company=jd.company,

        #     experience_years=resume.experience_years,

        #     ats_score=ats.overall_fit_score,

        #     interview_difficulty=self._difficulty(
        #         ats.overall_fit_score
        #     ),

        #     validate_skills=self._validate_skills(
        #         ats
        #     ),

        #     probe_skills=list(
        #         ats.missing_required_skills
        #     ),

        #     candidate_strengths=self._candidate_strengths(
        #         ats
        #     ),

        #     focus_projects=self._projects(
        #         resume
        #     ),

        #     experience_highlights=self._experience(
        #         resume
        #     )
        # )

    def _difficulty(
        self,
        ats_score: float
    ) -> str:

        if ats_score >= 90:
            return "Hard"

        if ats_score >= 75:
            return "Medium"

        return "Easy"

    def _validate_skills(
        self,
        ats: AtsResult
    ) -> List[str]:

        skills = []

        skills.extend(
            ats.matched_required_skills
        )

        skills.extend(
            ats.matched_preferred_skills
        )

        # Preserve order while removing duplicates
        return list(
            dict.fromkeys(skills)
        )

    def _candidate_strengths(
        self,
        ats: AtsResult
    ) -> List[str]:

        return [
            strength.skill
            for strength in ats.candidate_strengths
        ]

    def _projects(
        self,
        resume: ResumeProfile
    ) -> List[Project]:

        projects = []

        for project in resume.projects:

            projects.append(
                Project(
                    name=project.name,
                    technologies=project.technologies,
                    interview_topics=self._project_topics(project),
                    achievements=project.achievements,
                )
            )

        return projects


    def _project_topics(
        self,
        project,
    ) -> List[str]:

        topics = []

        topics.extend(project.technologies)

        for achievement in project.achievements:
            text = achievement.lower()

            if "architecture" in text:
                topics.append("System Design")

            if "scal" in text:
                topics.append("Scalability")

            if "kafka" in text:
                topics.append("Kafka")

            if "redis" in text:
                topics.append("Redis")

            if "microservice" in text:
                topics.append("Microservices")

            if "transaction" in text:
                topics.append("Transactions")

            if "cache" in text:
                topics.append("Caching")

            if "performance" in text or "latency" in text:
                topics.append("Performance Optimization")

        return list(dict.fromkeys(topics))

    def _experience(
        self,
        resume: ResumeProfile
    ) -> List[str]:

        highlights = []

        for exp in resume.experience:

            role = exp.role.strip()

            company = exp.company.strip()

            header = " at ".join(
                filter(
                    None,
                    [role, company]
                )
            )

            if header:
                highlights.append(header)

            highlights.extend(
                exp.achievements
            )

        return highlights