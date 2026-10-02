import logging

from orchestrator.agents.resume_agent import (
    resume_agent
)

logger = logging.getLogger(__name__)


class ResumeStage:

    def execute(
            self,
            context
    ):

        if context.resume_profile:
            return

        logger.info(
            "Executing Resume Stage"
        )

        context.resume_profile = (
            resume_agent.analyze(
                context.task["resumeText"]
            )
        )