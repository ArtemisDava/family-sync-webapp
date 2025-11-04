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

  async deleteFamily(id: string, token?: string) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/families/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete family");
      }
    } catch (error) {
      console.error("Error deleting family:", error);
      throw error;
    }
  },

  async removeFamilyMember(familyId: string, memberId: string, token?: string) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/families/${familyId}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to remove family member");
      }
    } catch (error) {
      console.error("Error removing family member:", error);
      throw error;
    }
  },

  async removeChildFromFamily(
    familyId: string,
    childId: string,
    token: string
  ) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/families/${familyId}/remove-child/${childId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove child from family");
      }

      return await response.json();
    } catch (error) {
      console.error("Error removing child from family:", error);
      throw error;
    }
  },
};
