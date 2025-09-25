const BASE_URL = `${import.meta.env.VITE_EXCHANGE_AUTH_BASE_URL}/api`;

const login = async (identifier: string, password: string) => {
  const isEmail = identifier.includes("@");
  const body = isEmail
    ? { email: identifier, password }
    : { username: identifier, password };
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return response.json();
};

const signup = async (
  name: string,
  username: string,
  email: string,
  password: string,
  profession: string,
  skillsToLearn: string[],
  skillsToTeach: string[],
  address: string,
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
    body: JSON.stringify({ name, username, email, password, profession, skillsToLearn, skillsToTeach, address, phoneNumber, instagram, twitter, github, linkedin }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Signup failed");
  }

  return response.json();
};

const forgotPassword = async (email: string) => {
  const response = await fetch(`${BASE_URL}/users/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Forgot password failed");
  }

  return response.json();
};

const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${BASE_URL}/users/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Reset password failed");
  }

  return response.json();
};

export const authService = {
  login,
  signup,
  forgotPassword,
  resetPassword,
};
