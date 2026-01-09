import { type CreateChildDto } from "../models/createChild.dto";

export const API_DOMAIN =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const ChildrenService = {
  async createChild(data: CreateChildDto, token: string) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/children`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create child");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating child:", error);
      throw error;
    }
  },

  async getChildrenById(childId: string, token: string) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/children/${childId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch child");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching child:", error);
      throw error;
    }
  },

  async patchChild(
    childId: string,
    data: Partial<CreateChildDto>,
    token: string
  ) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/children/${childId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update child");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating child:", error);
      throw error;
    }
  },

  async getChildrenByUser(userId: string, token: string) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/children/user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch children by user");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching children by user:", error);
      throw error;
    }
  },
};
