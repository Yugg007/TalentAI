import logging

from orchestrator.agents.jd_agent import (
    jd_agent
)

logger = logging.getLogger(__name__)


class JDStage:

    def execute(
            self,
            context
    ):

        if context.jd_profile:
            return

        logger.info(
            "Executing JD Stage"
        )

        context.jd_profile = (
            jd_agent.analyze(
                context.task[
                    "jobDescription"
                ]
            )
        )