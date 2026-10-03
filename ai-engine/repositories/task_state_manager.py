from datetime import datetime, timezone
from repositories.repository_manager import repository_manager
import logging

logger = logging.getLogger(__name__)

class TaskStateManager:
    """
    Responsible ONLY for processing state transitions and business metadata logic.
    """
    def __init__(self):
        self.repository = repository_manager.get_task_repository()

    def get_pending_and_failed_tasks(self) -> list:
        return self.repository.find_by_statuses(["PENDING", "FAILED"])

    def update_status(self, task_id: str, status: str):
        payload = {
            "status": status,
            "updatedAt": datetime.now(timezone.utc)
        }
        self.repository.update_fields(task_id, payload)

    def update_stage_progress(self, task_id: str, stage_name: str, stage_data: dict):
        """
        Atomically checkpoint stage output and its completion state.
        """
        now = datetime.now(timezone.utc)
        payload = {
            f"result.{stage_name}": stage_data,
            f"stages.{stage_name}.status": "COMPLETED",
            f"stages.{stage_name}.completedAt": now,
            "updatedAt": now
        }
        self.repository.update_fields(task_id, payload)

    def mark_stage_completed(self, task_id: str, stage_name: str):
        now = datetime.now(timezone.utc)
        payload = {
            f"stages.{stage_name}.status": "COMPLETED",
            f"stages.{stage_name}.completedAt": now,
            "updatedAt": now
        }
        self.repository.update_fields(task_id, payload)

    def mark_completed(self, task_id: str):
        payload = {
            "status": "COMPLETED",
            "completedAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }
        self.repository.update_fields(task_id, payload)

    def mark_failed(self, task_id: str, error_message: str):
        payload = {
            "status": "FAILED",
            "failedAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
            "error": error_message
        }
        self.repository.update_fields(task_id, payload)

task_state_manager = TaskStateManager()