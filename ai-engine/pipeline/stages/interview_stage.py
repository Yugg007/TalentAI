from orchestrator.agents.interview_agent import (
    interview_agent
)


class InterviewStage:

    def execute(
            self,
            context
    ):

        print("Executing Interview Stage")
        context.interview_preparation = (
            interview_agent.generate(
                context.resume_profile,
                context.jd_profile,
                context.ats_result
            )
        )