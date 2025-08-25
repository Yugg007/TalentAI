let users = [];

/**
 * Add a new user if not already present
 */
const addUser = (username, socketId) => {
  if (!users.some(user => user.username === username)) {
    users.push({ username, socketId });
  }
};

/**
 * Get socketId for a given username
 */
const getUserSocketId = (username) => {
  return users.find(user => user.username === username)?.socketId;
};

/**
 * Remove user by socketId
 */
const removeUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId);
};

/**
 * Get all connected users
 */
const getAllUsers = () => users;

/**
 * Get socketIds of all group members
 */
const getGroupSocketIds = (members) => {
  return users
    .filter(user => members.includes(user.username))
    .map(user => user.socketId);
};

export { addUser, removeUser, getAllUsers, getUserSocketId, getGroupSocketIds };
