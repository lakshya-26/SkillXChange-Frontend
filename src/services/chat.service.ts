import { API_URLS } from "../utils/constants";
import { authService } from "./auth.service";

const BASE_URL = `${API_URLS.COMMUNICATION_SERVICE}/api/conversation`;

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string; // If applicable
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    userId: string;
    name?: string;
    username?: string;
    profilePicture?: string;
  }[];
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount?: number;
}

const getHeaders = () => {
  const token = authService.getAccessToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const getConversations = async (
  page = 1,
  limit = 20
): Promise<{
  conversations: Conversation[];
  hasMore: boolean;
  total: number;
}> => {
  const response = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }

  const result = await response.json();
  const { conversations, hasMore, total } = result.data;
  return { conversations: conversations || [], hasMore, total };
};

const getMessages = async (
  conversationId: string,
  page = 1,
  limit = 20
): Promise<{ messages: Message[]; hasMore: boolean; total: number }> => {
  const response = await fetch(
    `${BASE_URL}/${conversationId}/messages?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  const result = await response.json();
  const { messages, hasMore, total } = result.data;
  return { messages: messages || [], hasMore, total };
};

const createConversation = async (
  participantId: string
): Promise<Conversation> => {
  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ userB: participantId }),
  });

  if (!response.ok) {
    throw new Error("Failed to create conversation");
  }

  const result = await response.json();
  return result.data;
};

const getConversationById = async (id: string): Promise<Conversation> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch conversation");
  }

  const result = await response.json();
  return result.data;
};

export const chatService = {
  getConversations,
  getMessages,
  createConversation,
  getConversationById,
};
