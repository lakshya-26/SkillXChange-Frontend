import { API_URLS } from "../utils/constants";
import { authService } from "./auth.service";

const BASE_URL = `${API_URLS.COMMUNICATION_SERVICE}/api/notification`;

export interface Notification {
  id: number;
  userId: number;
  title?: string;
  body: string;
  type: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

const getHeaders = () => {
  const token = authService.getAccessToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const getNotifications = async (
  page = 1,
  limit = 20
): Promise<{
  notifications: Notification[];
  hasMore: boolean;
  total: number;
  unreadCount: number;
}> => {
  const response = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const result = await response.json();
  const { notifications, hasMore, total, unreadCount } = result.data;
  return { notifications: notifications || [], hasMore, total, unreadCount };
};

const markAsRead = async (id: number): Promise<Notification> => {
  const response = await fetch(`${BASE_URL}/${id}/read`, {
    method: "PATCH",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  const result = await response.json();
  return result.data;
};

export const notificationService = {
  getNotifications,
  markAsRead,
};
