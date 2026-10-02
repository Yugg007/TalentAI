import logging
import threading
import time

from concurrent.futures import ThreadPoolExecutor

from pipeline.ai_pipeline import ai_pipeline
from repositories.task_state_manager import task_state_manager

logger = logging.getLogger(__name__)


class Scheduler:

    POLL_INTERVAL = 5
    MAX_WORKERS = 1

    def run(self):

        executor = ThreadPoolExecutor(
            max_workers=self.MAX_WORKERS
        )

        logger.info(
            "AI Scheduler Started"
        )

        while True:

            try:

                tasks = (
                    task_state_manager.get_pending_and_failed_tasks()
                )

                if tasks:

                    logger.info(
                        "Found %s pending tasks",
                        len(tasks)
                    )

                for task in tasks:

                    task_id = str(
                        task["_id"]
                    )

                    logger.info(
                        "Processing task %s",
                        task_id
                    )

                    task_state_manager.update_status(
                        task_id,
                        "PROCESSING"
                    )

                    executor.submit(
                        self.process_task,
                        task
                    )

            except Exception:

                logger.exception(
                    "Scheduler Failure"
                )

            time.sleep(
                self.POLL_INTERVAL
            )

    def process_task(
        self,
        task
    ):

        task_id = str(
            task["_id"]
        )

        try:

            ai_pipeline.execute(
                task
            )

            task_state_manager.mark_completed(
                task_id
            )

            logger.info(
                "Completed task %s",
                task_id
            )

        except Exception as ex:

            logger.exception(
                "Task Failed %s",
                task_id
            )

            task_state_manager.mark_failed(
                task_id,
                str(ex)
            )


def start_scheduler():

    scheduler = Scheduler()

    thread = threading.Thread(
        target=scheduler.run,
        daemon=True,
        name="ai-scheduler"
    )

    thread.start()

    logger.info(
        "Scheduler thread started"
    )