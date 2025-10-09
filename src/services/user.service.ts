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
};

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
    | "skillsToTeach"
  >
>;

export const userService = {
  async me(): Promise<UserDetails> {
    const res = await apiFetch(`${BASE_URL}/users/me`, { method: "GET" });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to fetch profile"
      );
    const { data } = await res.json();
    return data as UserDetails;
  },

  async profileById(id: string | number): Promise<UserDetails> {
    const res = await apiFetch(`${BASE_URL}/users/profile/${id}`, { method: "GET" });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
          "Failed to fetch user profile"
      );
    const { data } = await res.json();
    return data as UserDetails;
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
            "Failed to update profile"
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
            "Failed to update profile"
        );
      const { data } = await res.json();
      return data as UserDetails;
    }
  },
};