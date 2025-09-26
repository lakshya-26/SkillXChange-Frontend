const BASE_URL = `${import.meta.env.VITE_EXCHANGE_AUTH_BASE_URL}/api`;

const getSkills = async (searchTerm: string) => {
  searchTerm = searchTerm.trim() ? `?term=${searchTerm}` : "";
  const response = await fetch(`${BASE_URL}/skills${searchTerm}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch skills");
  }

  return response.json();
};

const addSkill = async (skillName: string) => {
  const response = await fetch(`${BASE_URL}/skills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ name: skillName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add skill");
  }

  return response.json();
};

export const skillService = {
  getSkills,
  addSkill,
};
