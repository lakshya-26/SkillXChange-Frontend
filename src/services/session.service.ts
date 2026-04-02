import { apiFetch } from "./api";

const BASE_URL = `${import.meta.env.VITE_EXCHANGE_AUTH_BASE_URL}/api`;

export type SessionStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type SessionUserSummary = {
  id: number;
  name: string;
  username: string;
  profileImage: string | null;
};

export type Session = {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string | null;
  status: SessionStatus;
  createdById: number;
  userAId: number;
  userBId: number;
  outcomeHappened?: boolean | null;
  outcomeDecidedAt?: string | null;
  outcomeDecidedById?: number | null;
  userA: SessionUserSummary;
  userB: SessionUserSummary;
};

export type ActionNeeded =
  | { type: "NONE" }
  | {
      type: "CONFIRM_HAPPENED";
      sessionId: string;
      title: string;
      scheduledAt: string;
      durationMinutes: number;
      otherUserId: number;
      otherUser: SessionUserSummary | null;
    }
  | {
      type: "RATE";
      sessionId: string;
      title: string;
      scheduledAt: string;
      durationMinutes: number;
      otherUserId: number;
      otherUser: SessionUserSummary | null;
    };

export const sessionService = {
  async createSession(payload: {
    title: string;
    description?: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingLink?: string;
    userBId: number;
  }): Promise<Session> {
    const res = await apiFetch(`${BASE_URL}/sessions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to create session",
      );
    const { data } = await res.json();
    return data as Session;
  },

  async listMySessions(params?: {
    page?: number;
    limit?: number;
    status?: SessionStatus;
  }): Promise<{
    items: Session[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  }> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.status) qs.set("status", params.status);

    const res = await apiFetch(`${BASE_URL}/sessions?${qs.toString()}`, {
      method: "GET",
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to fetch sessions",
      );
    const { data } = await res.json();
    return data;
  },

  async getActionNeeded(): Promise<ActionNeeded> {
    const res = await apiFetch(`${BASE_URL}/sessions/action-needed`, {
      method: "GET",
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to fetch session actions",
      );
    const { data } = await res.json();
    return data as ActionNeeded;
  },

  async decideHappened(sessionId: string, happened: boolean): Promise<Session> {
    const res = await apiFetch(`${BASE_URL}/sessions/${sessionId}/happened`, {
      method: "PATCH",
      body: JSON.stringify({ happened }),
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to update session outcome",
      );
    const { data } = await res.json();
    return data as Session;
  },

  async acceptSession(sessionId: string): Promise<Session> {
    const res = await apiFetch(`${BASE_URL}/sessions/${sessionId}/accept`, {
      method: "PATCH",
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to accept session",
      );
    const { data } = await res.json();
    return data as Session;
  },

  async rejectSession(sessionId: string): Promise<Session> {
    const res = await apiFetch(`${BASE_URL}/sessions/${sessionId}/reject`, {
      method: "PATCH",
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to reject session",
      );
    const { data } = await res.json();
    return data as Session;
  },

  async cancelSession(sessionId: string): Promise<Session> {
    const res = await apiFetch(`${BASE_URL}/sessions/${sessionId}/cancel`, {
      method: "PATCH",
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to cancel session",
      );
    const { data } = await res.json();
    return data as Session;
  },

  async completeSession(sessionId: string): Promise<Session> {
    const res = await apiFetch(`${BASE_URL}/sessions/${sessionId}/complete`, {
      method: "PATCH",
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to complete session",
      );
    const { data } = await res.json();
    return data as Session;
  },

  async checkRatingEligibility(otherUserId: number): Promise<{
    allowed: boolean;
    reason?: string;
    sessionId?: string;
  }> {
    const res = await apiFetch(
      `${BASE_URL}/sessions/rating-eligibility?otherUserId=${otherUserId}`,
      { method: "GET" },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to check rating eligibility");
    }
    const { data } = await res.json();
    return data;
  },

  async submitRating(payload: {
    rateeId: number;
    stars: number;
    feedback?: string;
    sessionId?: string;
  }) {
    const res = await apiFetch(`${BASE_URL}/sessions/ratings`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to submit rating",
      );
    const { data } = await res.json();
    return data;
  },
};

