from repositories.task_state_manager import task_state_manager

class PersistStage:
    def execute(self, context, stage_name: str, stage_data: dict):
        """
        Saves individual stage data into the database in real-time.
        """
        
        task_state_manager.update_stage_progress(
            context.task["_id"],
            stage_name,
            stage_data
        )
    
    def mark_stage_completed(self, context, stage_name: str):
        """
        Marks a specific stage as completed in the database.
        """
        task_state_manager.mark_stage_completed(
            context.task["_id"],
            stage_name
        )

# class PersistStage:

#     def execute(
#             self,
#             context
#     ):

#         result = {

#             "resume_profile":
#             context.resume_profile,

#             "jd_profile":
#             context.jd_profile,

#             "ats_result":
#             context.ats_result,

#             "interview_preparation":
#             context.interview_preparation
#         }

#         task_repository.mark_completed(
#             context.task["_id"],
#             result
#         )