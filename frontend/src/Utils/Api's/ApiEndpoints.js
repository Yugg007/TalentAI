const ApiEndpoints = {
    // Spring Backend API Endpoints
    "register" : "user/register",
    "login" : "user/login",
    "authStatus" : "/user/authStatus",
    "logout" : "/user/logout",
    "updatePersonInfo" : "user/updatePersonInfo",
    "downloadResume" : "user/downloadResume",
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
    "generateATSScore": "/ai/generateATSScore",
    "chatWithAI": "/ai/chatWithAI",

    "checkMembership": "/groups/checkMembership",
    "fetchGroupDetails": "/groups/fetchGroupDetails",
    "createGroup": "/groups/createGroup",
    "askToJoinGroup": "/groups/askToJoin",
    "updateAskToJoinStatus": "/groups/updateAskToJoinStatus",
    
    "fetchGroupMessages": "/messages/fetchGroupMessages",
    "fetchPrivateMessages": "/messages/fetchPrivateMessage",
    
}

export default ApiEndpoints;