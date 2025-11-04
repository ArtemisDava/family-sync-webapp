export const API_DOMAIN =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const FamiliesService = {
  async createFamily(name: string, token?: string) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/families`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to create family");
      }
      return response.json();
    } catch (error) {
      console.error("Error creating family:", error);
      throw error;
    }
  },

  async getFamilies(token?: string) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/families/by-user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch families");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching families:", error);
      throw error;
    }
  },

  async getFamilyById(id: string, token?: string) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/families/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch family");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching family:", error);
      throw error;
    }
  },

  async joinToTheFamily(code: string, token?: string) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/families/join/${code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to join family");
      }
      return response.json();
    } catch (error) {
      console.error("Error joining family:", error);
      throw error;
    }
  },
};
