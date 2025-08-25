const ApiEndpoints = {
    // Spring Backend API Endpoints
    "register" : "user/register",
    "login" : "user/login",
    "authStatus" : "/user/authStatus",
    "logout" : "/user/logout",
    "updatePersonInfo" : "user/updatePersonInfo",
    "fetchUserByUsername": "/user/fetchUserByUsername",

    "getConnections" : "/connection/loadConnections",
    "sendConnectionRequest":"/connection/sendConnectionRequest",
    "acceptPendingRequest": "/connection/acceptPendingRequest",

    "checkAtsScore" : "resume/checkATSScore",

    "createJob": "job/createJob",
    "fetchJobById": "job/fetchJobById",
    "fetchAllJobs": "job/fetchAllJobs",



    "scheduleMeeting": "/meeting/schedule",
    "getUpcomingMeetings": "/meeting/upcoming-meetings",
    "deleteMeeting": "/meeting/delete-meeting",


    "checkGoogleToken" : "/api/google/check-token",

    // Node Backend API Endpoints
    "generateATSScore": "/api/ai/generateATSScore",
     "chatWithAI": "/api/ai/chatWithAI",

    "checkMembership": "/api/groups/checkMembership",
    "fetchGroupDetails": "/api/groups/fetchGroupDetails",
    "createGroup": "/api/groups/createGroup",
    "askToJoinGroup": "/api/groups/askToJoin",
    "updateAskToJoinStatus": "/api/groups/updateAskToJoinStatus",
    
    "fetchGroupMessages": "/api/messages/fetchGroupMessages",
    "fetchPrivateMessages": "/api/messages/fetchPrivateMessage",
    
}

export default ApiEndpoints;