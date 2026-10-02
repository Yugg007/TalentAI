import logging
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

class TaskRepository:
    """
    Responsible ONLY for database data exchange. 
    Does not know business definitions of 'failed', 'completed', or execution logic.
    """
    def __init__(self, collection):
        self.collection = collection

    def _to_object_id(self, task_id: str) -> ObjectId:
        return ObjectId(task_id) if isinstance(task_id, str) else task_id

    def find_by_statuses(self, statuses: list) -> list:
        logger.info(f"Fetching tasks matching statuses: {statuses}")
        return list(self.collection.find({"status": {"$in": statuses}}))

    def update_fields(self, task_id: str, fields_to_set: dict) -> bool:
        """
        Generic, atomic update operation following SRP. 
        Accepts any valid Mongo dictionary to target fields.
        """
        try:
            query_id = self._to_object_id(task_id)
            result = self.collection.update_one(
                {"_id": query_id},
                {"$set": fields_to_set}
            )
            logger.debug(f"Update for {task_id}: matched={result.matched_count}, modified={result.modified_count}")
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Database error updating task fields for {task_id}: {e}", exc_info=True)
            raise


# from pymongo import MongoClient
# from datetime import datetime
# import logging
# from bson.objectid import ObjectId

# logger = logging.getLogger(__name__)


# class TaskRepository:

#     def __init__(
#             self,
#             collection
#     ):
#         self.collection = collection

#     def find_pending(self):

#         logger.info(
#             f"Finding pending tasks from "
#             f"{self.collection.name}"
#         )

#         tasks = list(
#             self.collection.find(
#                 {
#                     "status": {"$in": ["PENDING", "FAILED"]}
#                 }
#             )
#         )

#         logger.info(
#             f"Found {len(tasks)} pending tasks"
#         )

#         return tasks

#     def update_status(
#             self,
#             task_id,
#             status
#     ):
#         logger.info(
#             f"Updating task {task_id} "
#             f"status to {status}"
#         )

#         result = self.collection.update_one(
#             {
#                 "_id": ObjectId(task_id)
#             },
#             {
#                 "$set": {
#                     "status": status,
#                     "updatedAt": datetime.utcnow()
#                 }
#             }
#         )

#         logger.info(
#             f"update_status "
#             f"matched={result.matched_count} "
#             f"modified={result.modified_count}"
#         )

#     def mark_completed(
#             self,
#             task_id,
#             result_data
#     ):

#         logger.info(
#             f"Marking task "
#             f"{task_id} "
#             f"as completed"
#         )

#         result = self.collection.update_one(
#             {
#                 "_id": ObjectId(task_id)
#             },
#             {
#                 "$set": {

#                     "status": "COMPLETED",

#                     "completedAt":
#                     datetime.utcnow(),

#                     "result":
#                     result_data
#                 }
#             }
#         )

#         logger.info(
#             f"mark_completed "
#             f"matched={result.matched_count} "
#             f"modified={result.modified_count}"
#         )

#     def mark_failed(
#             self,
#             task_id,
#             error
#     ):

#         logger.error(
#             f"Marking task "
#             f"{task_id} "
#             f"as FAILED"
#         )

#         result = self.collection.update_one(
#             {
#                 "_id": ObjectId(task_id)
#             },
#             {
#                 "$set": {

#                     "status": "FAILED",

#                     "failedAt":
#                     datetime.utcnow(),

#                     "error":
#                     error
#                 }
#             }
#         )

#         logger.info(
#             f"mark_failed "
#             f"matched={result.matched_count} "
#             f"modified={result.modified_count}"
#         )

#     def mark_stage_completed(
#         self,
#         task_id,
#         stage_name
#     ):

#         self.collection.update_one(
#             {"_id": task_id},
#             {
#                 "$set": {
#                     f"stages.{stage_name}": True,
#                     "currentStage": stage_name
#                 }
#             }
#         )

#     def update_task_progress(self, task_id: str, update_payload: dict) -> bool:
#             """
#             Partially updates a task's result sub-document using an atomic $set operation.
#             """
#             try:
#                 # Convert string ID to ObjectId if your DB uses ObjectIds
#                 query_id = ObjectId(task_id) if isinstance(task_id, str) else task_id
                
#                 # Use MongoDB's $set operator to update ONLY the fields provided in the payload
#                 result = self.collection.update_one(
#                     {"_id": query_id},
#                     {"$set": update_payload}
#                 )
                
#                 return result.modified_count > 0
                
#             except Exception as e:
#                 # Replace with your actual logger
#                 print(f"Failed to update task progress for {task_id}: {e}")
#                 raise
        

# client = MongoClient(
#     "mongodb://localhost:27017"
# )

# db = client["TalentAI"]

# collection = db["ats_task"]

# task_repository = TaskRepository(
#     collection
# )