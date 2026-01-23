import { apiFetch } from "./api";
const BASE_URL = `${import.meta.env.VITE_EXCHANGE_AUTH_BASE_URL}/api`;

export type UserDetails = {
  id: number;
  name: string;
  username: string;
  email: string;
  profession?: string;
  address?: string;
  phoneNumber?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  profileImage?: string;
  skillsToLearn?: string[];
  skillsToTeach?: string[];
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  profileScore?: number;

  reputationScore?: number;
  reputationUpdatedAt?: string;
  badges?: string[];
};

export type Badge = {
  badge_type: string;
  earned_at: string;
};

export interface ProfileScore {
  score: number;
  max: number;
  level: string;
  earned: string[];
  missing: string[];
}

type UpdatePayload = Partial<
  Pick<
    UserDetails,
    | "name"
    | "username"
    | "email"
    | "profession"
    | "address"
    | "phoneNumber"
    | "instagram"
    | "twitter"
    | "github"
    | "linkedin"
    | "skillsToLearn"
    | "skillsToLearn"
    | "skillsToTeach"
    | "isPhoneVerified"
  >
>;

export const userService = {
  async me(): Promise<UserDetails> {
    const res = await apiFetch(`${BASE_URL}/users/me`, { method: "GET" });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to fetch profile",
      );
    const { data } = await res.json();
    return data as UserDetails;
  },

  async profileById(id: string | number): Promise<UserDetails> {
    const res = await apiFetch(`${BASE_URL}/users/profile/${id}`, {
      method: "GET",
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to fetch user profile",
      );
    const { data } = await res.json();
    return data as UserDetails;
  },

  async getProfileScore(): Promise<ProfileScore> {
    const res = await apiFetch(`${BASE_URL}/users/me/profile-score`, {
      method: "GET",
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to fetch profile score",
      );
    const { data } = await res.json();
    return data as ProfileScore;
  },

  async checkRatingEligibility(
    rateeId: number,
  ): Promise<{ allowed: boolean; reason?: string; conversationId?: string }> {
    const res = await apiFetch(
      `${BASE_URL}/ratings/eligibility?rateeId=${rateeId}`,
      {
        method: "GET",
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to check eligibility");
    }
    const { data } = await res.json();
    return data;
  },

  async rateUser(payload: {
    rateeId: number;
    conversationId: string;
    stars: number;
    feedback?: string;
  }) {
    const res = await apiFetch(`${BASE_URL}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to submit rating",
      );
    return await res.json();
  },

  async updateProfile(payload: UpdatePayload & { profileImage?: File | null }) {
    const url = `${BASE_URL}/users/profile`;
    const hasFile = !!payload.profileImage;

    if (hasFile) {
      const fd = new FormData();
      if (payload.profileImage) fd.append("profileImage", payload.profileImage);

      const scalarKeys: (keyof UpdatePayload)[] = [
        "name",
        "username",
        "email",
        "profession",
        "address",
        "phoneNumber",
        "instagram",
        "twitter",
        "github",
        "linkedin",
        "isPhoneVerified",
      ];
      scalarKeys.forEach((k) => {
        const val = payload[k];
        if (typeof val !== "undefined" && val !== null && val !== "") {
          fd.append(k, String(val));
        }
      });

      if (payload.skillsToLearn)
        fd.append("skillsToLearn", JSON.stringify(payload.skillsToLearn));
      if (payload.skillsToTeach)
        fd.append("skillsToTeach", JSON.stringify(payload.skillsToTeach));

      const res = await apiFetch(url, {
        method: "PUT",
        body: fd,
      });
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message ||
            "Failed to update profile",
        );
      const { data } = await res.json();
      return data as UserDetails;
    } else {
      const res = await apiFetch(url, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message ||
            "Failed to update profile",
        );
      const { data } = await res.json();
      return data as UserDetails;
    }
  },

  async searchUsers(query: string): Promise<UserMatch[]> {
    const res = await apiFetch(
      `${BASE_URL}/users/search?term=${encodeURIComponent(query)}`,
      {
        method: "GET",
      },
    );
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to search users",
      );
    const { data } = await res.json();
    return data as UserMatch[];
  },

  async getRecommendations(): Promise<UserMatch[]> {
    const res = await apiFetch(`${BASE_URL}/users/recommendations`, {
      method: "GET",
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to fetch recommendations",
      );
    const { data } = await res.json();
    return data as UserMatch[];
  },
};

export interface UserMatch {
  id: number;
  name: string;
  username: string;
  email: string;
  profession: string;
  skills: { id: number; name: string; type: "LEARN" | "TEACH" }[];
  score: number;
  reasons: {
    theyTeachYou: string[];
    youTeachThem: string[];
    profileMatch: boolean;
  };
}
