from concurrent.futures import (
    ThreadPoolExecutor
)

from pipeline.pipeline_context import (
    PipelineContext
)

from pipeline.stages.resume_stage import (
    ResumeStage
)

from pipeline.stages.jd_stage import (
    JDStage
)

from pipeline.stages.interview_stage import (
    InterviewStage
)

from pipeline.stages.persist_stage import (
    PersistStage
)

from pipeline.stages.ats_score_stage import AtsScoreStage

class AIPipeline:
    def __init__(self):
        self.resume_stage = ResumeStage()
        self.jd_stage = JDStage()
        self.ats_result_stage = AtsScoreStage()
        self.interview_stage = InterviewStage()
        self.persist_stage = PersistStage()

    def execute(self, task):
        context = PipelineContext(task=task)
        existing_results = task.get("result", {})

        print("Starting pipeline execution for task:", task["_id"])
        print("Existing results found:", existing_results.keys())


        # ----------------------------------------------------------
        # Parallel Stages: Resume & JD Parsing
        # ----------------------------------------------------------
        with ThreadPoolExecutor(max_workers=2) as executor:
            resume_future = None
            jd_future = None

            # Skip or Execute Resume Stage
            if "resume_profile" in existing_results:
                print("Skipping ResumeStage: Loaded cached data.")
                context.resume_profile = existing_results["resume_profile"]
            else:
                resume_future = executor.submit(self.resume_stage.execute, context)

            # Skip or Execute JD Stage
            if "jd_profile" in existing_results:
                print("Skipping JDStage: Loaded cached data.")
                context.jd_profile = existing_results["jd_profile"]
            else:
                jd_future = executor.submit(self.jd_stage.execute, context)

            # Wait and persist if processing actually happened
            if resume_future:
                resume_future.result()
                self.persist_stage.execute(context, "resume_profile", context.resume_profile)

            if jd_future:
                jd_future.result()
                self.persist_stage.execute(context, "jd_profile", context.jd_profile)

        print("Resume and JD segments validated.")

        # ----------------------------------------------------------
        # Sequential Stage: ATS Score
        # ----------------------------------------------------------
        if "ats_result" in existing_results:
            print("Skipping AtsScoreStage: Loaded cached data.")
            context.ats_result = existing_results["ats_result"]
        else:
            self.ats_result_stage.execute(context)
            self.persist_stage.execute(context, "ats_result", context.ats_result)

        # ----------------------------------------------------------
        # Sequential Stage: Interview Prep
        # ----------------------------------------------------------
        if "interview_preparation" in existing_results:
            print("Skipping InterviewStage: Loaded cached data.")
            context.interview_preparation = existing_results["interview_preparation"]
        else:
            self.interview_stage.execute(context)
            self.persist_stage.execute(context, "interview_preparation", context.interview_preparation)

        # ----------------------------------------------------------
        # Pipeline Finalization
        # ----------------------------------------------------------
        # self.persist_stage.mark_stage_completed(context, "interview_preparation")
        print("Pipeline execution verified and finalized.")


# class AIPipeline:

#     def __init__(self):

#         self.resume_stage = ResumeStage()

#         self.jd_stage = JDStage()

#         self.ats_result_stage = AtsScoreStage()

#         self.interview_stage = InterviewStage()

#         self.persist_stage = PersistStage()

#     def execute(
#             self,
#             task
#     ):

#         context = PipelineContext(
#             task=task
#         )

#         with ThreadPoolExecutor(
#                 max_workers=2
#         ) as executor:

#             resume_future = (
#                 executor.submit(
#                     self.resume_stage.execute,
#                     context
#                 )
#             )

#             jd_future = (
#                 executor.submit(
#                     self.jd_stage.execute,
#                     context
#                 )
#             )

#             resume_future.result()
#             print("Resume : ", context.resume_profile)
#             # jd_future.result()

#             print("Resume and JD stages completed")


#         # print("Resume profile : ", context.resume_profile)
#         # print("JD profile : ", context.jd_profile)

#         # context.resume_profile = {'technical_skills': ['aws', 'c++', 'ci/cd', 'distributed caching', 'docker', 'event-driven architecture', 'java', 'javascript', 'kafka', 'microservices', 'mongodb', 'mysql', 'postgresql', 'python', 'redis', 'spring boot'], 'conceptual_skills': ['concurrency', 'jwt', 'oauth2', 'system design'], 'experience_years': 3.0, 'experience': [{'company': 'ICICI Prudential Life Insurance', 'role': 'Software Engineer 2', 'duration': 'July 2023 – Present', 'achievements': ['96% reduction in technical debt by architecting a metadata-driven rule engine.', '66% reduction in end-to-end processing latency by designing asynchronous workflows across medical and policy microservices.', '85% improvement in partner go-live velocity (12 days to 2 days) via automated API provisioning.', 'Reduced query latency from 10s to <100ms using custom key-based caching layer.']}, {'company': 'Google Summer of Code (GSoC ’23) — AOSSIE Organization', 'role': '', 'duration': 'May 2023 – Aug 2023', 'achievements': ['Engineered and integrated 3 advanced voting algorithms into a unified election framework.', 'Architected modular smart contracts using the Diamond Standard (EIP-2535).']}], 'projects': [{'name': 'Routely - Ride Sharing Platform', 'duration': 'Sep 2025 – Feb 2026', 'technologies': ['kafka', 'protocol buffers (protobuf)', 'redis geo-indexing', 'resilience4j circuit breakers', 'spring cloud gateway'], 'achievements': ['Eliminated ”ghost notifications” by architecting a Transactional Outbox Pattern with Apache Kafka.', 'Reduced driver-dispatch latency by 60% by migrating location lookups to Redis Geo-indexing.', 'Slashed network overhead by 75% by implementing Protocol Buffers (Protobuf) for Kafka serialization.']}, {'name': 'TalentAI', 'duration': 'Dec 2024 – Feb 2025', 'technologies': ['cohere/openai', 'mongodb caching', 'socket.io'], 'achievements': ['Built an AI-powered resume matching engine using Cohere/OpenAI and MongoDB caching.', 'Maintained sub-200ms latency even during peak traffic, improving user engagement metrics.']}], 'education': [{'institution': 'National Institute of Technology (NIT Trichy), India', 'degree': 'Bachelor of Technology (B.Tech)', 'duration': 'Jul 2019 – May 2023'}]}
#         context.resume_profile = {'technical_skills': ['aws', 'c++', 'ci/cd', 'distributed caching', 'docker', 'event-driven architecture', 'java', 'javascript', 'kafka', 'microservices', 'mongodb', 'mysql', 'postgresql', 'python', 'redis', 'spring boot'], 'conceptual_skills': ['concurrency', 'jwt', 'oauth2', 'system design'], 'experience_years': 3.0, 'resume_summary': 'SDE II with 3 YOE building scalable backend and distributed systems using Java, Spring Boot, Kafka, Redis, and AWS.', 'certifications': [], 'project_domains': ['Ride Sharing Platform'], 'achievements': ['GsoC’23: Selected among global contributors and delivered production-ready decentralized governance features for AOSSIE.', 'LeetCode: Solved 800+ problems; Peak Rating: 1756; Secured 2436 Global Max Contest Rank.'], 'primary_languages': ['Java', 'Python'], 'frameworks': ['Spring Boot'], 'cloud_platforms': ['AWS'], 'databases': ['MySQL', 'PostgreSQL', 'MongoDB'], 'architecture_keywords': ['Microservices', 'Event-Driven Architecture', 'Distributed Caching', 'System Design'], 'leadership_examples': [], 'quantified_achievements': [{'achievement': '96% reduction in technical debt', 'metric': ''}, {'achievement': '66% reduction in end-to-end processing latency', 'metric': ''}, {'achievement': '85% improvement in partner go-live velocity', 'metric': ''}], 'experience': [{'company': 'ICICI Prudential Life Insurance', 'role': 'Software Engineer 2', 'duration': 'July 2023 – Present', 'achievements': ['96% reduction in technical debt', '66% reduction in end-to-end processing latency', '85% improvement in partner go-live velocity']}, {'company': 'Google Summer of Code (GSoC ’23) — AOSSIE Organization', 'role': '', 'duration': 'May 2023 – Aug 2023', 'achievements': ['Engineered and integrated 3 advanced voting algorithms into a unified election framework']}], 'projects': [{'name': 'Routely - Ride Sharing Platform', 'duration': 'Sep 2025 – Feb 2026', 'technologies': ['kafka', 'protocol buffers (protobuf)', 'redis geo-indexing', 'resilience4j circuit breakers', 'spring cloud gateway'], 'achievements': ['Eliminated ”ghost notifications” by architecting a Transactional Outbox Pattern with Apache Kafka', 'Reduced driver-dispatch latency by 60% by migrating location lookups toRedis Geo-indexing', 'Slashed network overhead by 75% by implementing Protocol Buffers (Protobuf) for Kafka serialization']}, {'name': 'AI-powered resume matching engine', 'duration': 'Dec 2024 – Feb 2025', 'technologies': ['cohere/openai', 'mongodb caching'], 'achievements': []}], 'education': [{'institution': 'National Institute of Technology (NIT Trichy), India', 'degree': 'Bachelor of Technology (B.Tech)', 'duration': 'Jul 2019 – May 2023'}]}
#         context.jd_profile = {'job_title': 'Software Development Engineer II (Backend) - Adtech', 'company': 'JioStar', 'location': 'Bengaluru', 'work_setting': 'Full Time / On-site', 'minimum_experience': 2.0, 'preferred_experience': 4.0, 'required_skills': ['go', 'java', 'python'], 'preferred_skills': ['aws', 'ci/cd', 'kafka'], 'soft_skills': ['collaboration'], 'education_requirements': ["Bachelors/master's in computer science or a related field"], 'salary_currency': '', 'salary_min': None, 'salary_max': None}


#         self.ats_result_stage.execute(
#             context
#         )

#         self.interview_stage.execute(
#             context
#         )


#         self.persist_stage.execute(
#             context
#         )


ai_pipeline = AIPipeline()