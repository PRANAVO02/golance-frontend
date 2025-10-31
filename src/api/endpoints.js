// src/api/endpoints.js

const BASE_URL = "http://localhost:8080/api";

export const ENDPOINTS = {
  REGISTER: `${BASE_URL}/users/register`,
  LOGIN: `${BASE_URL}/auth/login`,

//   POST_TASK: `${BASE_URL}/tasks`,
  TASKS: `${BASE_URL}/tasks`,
  TASKS_BY_USER: (userId) => `${BASE_URL}/tasks/user/${userId}`,
  ASSIGNED_TASKS: (userId) => `${BASE_URL}/tasks/user/${userId}/assigned-tasks`,

  TASK_ALLOCATE: (taskId, bidId) => `${BASE_URL}/bids/tasks/${taskId}/allocate/${bidId}`,
  TASK_UPDATE_STATUS: (taskId) => `${BASE_URL}/tasks/${taskId}/status`,

  BIDS_BY_TASK: (taskId) => `${BASE_URL}/bids/tasks/${taskId}`,
  BIDS_BY_USER: (userId) => `${BASE_URL}/bids/user/${userId}`,
  DELETE_BID: (bidId) => `${BASE_URL}/bids/${bidId}`,

  USERS: (id) => `${BASE_URL}/users/${id}`,
  // 🔹 Wallet-related
  WALLET_BALANCE: (userId) => `${BASE_URL}/wallet/balance/${userId}`,
  WALLET_RECHARGE: `${BASE_URL}/wallet/recharge`,
  WALLET_TRANSFER: `${BASE_URL}/wallet/transfer`,
  TRANSACTIONS: (userId) => `${BASE_URL}/transactions/${userId}`,

  UPLOAD_FILE: `${BASE_URL}/files/upload`,
  TASK_DOWNLOAD: (taskId) => `${BASE_URL}/tasks/download/${taskId}`,
  UPLOAD_FREELANCER_FILE: (taskId) => `${BASE_URL}/tasks/upload/freelancer/${taskId}`,

  // USER_RATE: (userId) => `${BASE_URL}/users/${userId}/rate`,


};
