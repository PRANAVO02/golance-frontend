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
  },

  // 🔹 WebSocket Base (for SockJS)
  WS_BASE: "http://localhost:8080/ws", // WebSocket connection endpoint
};
