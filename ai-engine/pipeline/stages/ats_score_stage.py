from orchestrator.agents.ats_score_agent import (
    ats_score_agent
)


class AtsScoreStage:

    def execute(
            self,
            context
    ):

        context.ats_result = (
            ats_score_agent.compare(
                context.resume_profile,
                context.jd_profile
            )
        )