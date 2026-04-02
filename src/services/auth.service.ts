const BASE_URL = `${import.meta.env.VITE_EXCHANGE_AUTH_BASE_URL}/api`;

type Tokens = { accessToken: string; refreshToken: string };
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

const setTokens = ({ accessToken, refreshToken }: Tokens) => {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};
const getAccessToken = () => localStorage.getItem(ACCESS_KEY) || "";
const getRefreshToken = () => localStorage.getItem(REFRESH_KEY) || "";
const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

const checkAvailability = async (params: {
  email?: string;
  username?: string;
}) => {
  const search = new URLSearchParams();
  if (params.email) search.set("email", params.email);
  if (params.username) search.set("username", params.username);
  const response = await fetch(`${BASE_URL}/users?${search.toString()}`);

  const data = await response.json();
  const message = (data && data.message) as string | undefined;
  const existsByEmail = params.email && data?.data?.email === params.email;
  const existsByUsername =
    params.username && data?.data?.username === params.username;

  return {
    available:
      message === "User not found"
        ? true
        : !(existsByEmail || existsByUsername),
    data,
  } as { available: boolean; data: any };
};

const signup = async (
  name: string,
  username: string,
  email: string,
  profession: string,
  skillsToLearn: string[],
  skillsToTeach: string[],
  address: string,
  googleToken: string,
  phoneNumber?: string,
  instagram?: string,
  twitter?: string,
  github?: string,
  linkedin?: string,
) => {
  const response = await fetch(`${BASE_URL}/users/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      username,
      email,
      profession,
      skillsToLearn,
      skillsToTeach,
      address,
      phoneNumber,
      instagram,
      twitter,
      github,
      linkedin,
      googleToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Signup failed");
  }

  const data = await response.json();
  if (data?.data?.accessToken && data?.data?.refreshToken) {
    setTokens({
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    });
  }
  return data;
};

const checkGoogleUser = async (googleToken: string) => {
  const response = await fetch(`${BASE_URL}/users/google-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ googleToken }),
  });

  // If status is 400+, throw error
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Google check failed");
  }

  return response.json();
};

const loginWithGoogle = async (googleToken: string) => {
  const response = await fetch(`${BASE_URL}/users/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ googleToken }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Google login failed");
  }

  const data = await response.json();
  if (data?.data?.accessToken && data?.data?.refreshToken) {
    setTokens({
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    });
  }
  return data;
};

const refreshTokens = async (): Promise<Tokens> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/users/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to refresh token");
  }

  const data = (await res.json()) as { data: Tokens };
  if (!data?.data?.accessToken || !data?.data?.refreshToken) {
    throw new Error("Invalid refresh response");
  }
  setTokens(data.data);
  return data.data;
};

export const authService = {
  signup,
  checkAvailability,
  checkGoogleUser,
  loginWithGoogle,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  refreshTokens,
};
