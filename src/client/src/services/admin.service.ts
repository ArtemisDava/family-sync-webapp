const API_DOMAIN =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const AdminService = {
  async getOverviewStats() {
    try {
      const result = await fetch(`${API_DOMAIN}/api/admin/stats/overview`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!result.ok) {
        throw new Error("Failed to fetch overview stats");
      }
      return result.json();
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      throw error;
    }
  },
};


export type UserFamilies = { 
    _id: string; 
    name: string; 
    families: { 
      _id: string, 
      name: string, 
      memberCount: number, 
      createdAt: string
    }[], 
    countOfChildren: number, 
    createdAt: Date 
}