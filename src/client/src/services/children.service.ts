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
};
