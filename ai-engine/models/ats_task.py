from models.db import mongo
from bson.json_util import dumps

def get_pending_tasks():
    print("Fetching pending tasks from MongoDB database: " + mongo.db.name) 
    
    # 1. Fetch the data
    pending_tasks_cursor = mongo.db.ats_task.find({"status": "PENDING"})
    
    # 2. Convert cursor to a standard Python list
    tasks = list(pending_tasks_cursor)
    
    # 3. Print the count
    print(f"Found {len(tasks)} pending tasks.")
    
    # # 4. PRINT TASKS HERE:
    # print("--- PENDING TASKS LIST ---")
    # # indent=4 makes it look clean and structured in your terminal
    # print(dumps(tasks, indent=4)) 
    # print("--------------------------")
    
    # 5. Clean up ObjectIds for the rest of your app's code
    for doc in tasks:
        doc['_id'] = str(doc['_id'])
        
    return tasks