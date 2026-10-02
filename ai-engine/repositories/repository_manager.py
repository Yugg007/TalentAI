from pymongo import MongoClient

from repositories.task_repository import TaskRepository

# Infrastructure Bootstrapping
client = MongoClient("mongodb://localhost:27017")
collection = client["TalentAI"]["ats_task"]


class RepositoryManager:
    def __init__(self):
        self.task_repository = TaskRepository(collection)

    def get_task_repository(self) -> TaskRepository:
        return self.task_repository
    
repository_manager = RepositoryManager()