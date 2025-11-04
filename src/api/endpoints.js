const BASE_URL = "http://localhost:8080/api";

export const ENDPOINTS = {
  // 🔹 Authentication
  REGISTER: `${BASE_URL}/users/register`,
  LOGIN: `${BASE_URL}/auth/login`,

  // 🔹 Tasks
  TASKS: `${BASE_URL}/tasks`,
  TASKS_BY_USER: (userId) => `${BASE_URL}/tasks/user/${userId}`,
  ASSIGNED_TASKS: (userId) => `${BASE_URL}/tasks/user/${userId}/assigned-tasks`,
  TASK_ALLOCATE: (taskId, bidId) => `${BASE_URL}/bids/tasks/${taskId}/allocate/${bidId}`,
  TASK_UPDATE_STATUS: (taskId) => `${BASE_URL}/tasks/${taskId}/status`,

  // 🔹 Bids
  BIDS_BY_TASK: (taskId) => `${BASE_URL}/bids/tasks/${taskId}`,
  BIDS_BY_USER: (userId) => `${BASE_URL}/bids/user/${userId}`,
  DELETE_BID: (bidId) => `${BASE_URL}/bids/${bidId}`,

  // 🔹 Users
  USERS: (id) => `${BASE_URL}/users/${id}`,

  // 🔹 Wallet
  WALLET_BALANCE: (userId) => `${BASE_URL}/wallet/balance/${userId}`,
  WALLET_RECHARGE: `${BASE_URL}/wallet/recharge`,
  WALLET_TRANSFER: `${BASE_URL}/wallet/transfer`,
  TRANSACTIONS: (userId) => `${BASE_URL}/transactions/${userId}`,

  // 🔹 Files
  UPLOAD_FILE: `${BASE_URL}/files/upload`,
  TASK_DOWNLOAD: (taskId) => `${BASE_URL}/tasks/download/${taskId}`,
  UPLOAD_FREELANCER_FILE: (taskId) => `${BASE_URL}/tasks/upload/freelancer/${taskId}`,

  // 🔹 Messaging (for MessagePage.jsx)
  MESSAGES: {
    CONTACTS: (userId) => `${BASE_URL}/messages/contacts/${userId}`, // Get all contacts for a user
    CONVERSATION: (userId, contactId) => `${BASE_URL}/messages/conversation/${userId}/${contactId}`, // Get messages between two users
    SEND: `${BASE_URL}/messages/send`, // Send a new message (HTTP fallback)
     START: `${BASE_URL}/messages/start`, 
  },

  // 🔹 WebSocket Base (for SockJS)
  WS_BASE: "http://localhost:8080/ws", // WebSocket connection endpoint
};
// Mock ENDPOINTS for demonstration since the original file isn't provided
// This is necessary for the preview to compile. Your original import is commented out above.
// const ENDPOINTS = {
//     USERS: (id) => `http://localhost:8080/api/users/${id}`,
//     TASKS: `http://localhost:8080/api/tasks`,
//     TASK_DOWNLOAD: (id) => `http://localhost:8080/api/tasks/download/${id}`,
//     // UPDATED to match your endpoints.js
//     BIDS_BY_TASK: (taskId) => `http://localhost:8080/api/bids/tasks/${taskId}`,
//     // UPDATED to match your endpoints.js
//     TASK_ALLOCATE: (taskId, bidId) =>
//       `http://localhost:8080/api/bids/tasks/${taskId}/allocate/${bidId}`,
//     WALLET_TRANSFER: `http://localhost:8080/api/wallet/transfer`,
// };