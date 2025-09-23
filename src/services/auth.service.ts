const BASE_URL = `${import.meta.env.VITE_EXCHANGE_AUTH_BASE_URL}/api`; // Assuming backend runs on port 8000 and has /api/v1 prefix

const login = async (identifier: string, password: string) => {
  console.log(identifier, password);
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

export const authService = {
  login,
};
