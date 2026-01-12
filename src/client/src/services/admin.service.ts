const API_DOMAIN =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface UserFamilyInfo {
  _id: string;
  name: string;
  memberCount: number;
  createdAt: string;
}

export interface UserFamilies {
  _id: string;
  name: string;
  email: string;
  families: UserFamilyInfo[];
  createdAt: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  year?: number;
}

export interface AdminCreateUserDto {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  color: string;
  phoneNumber?: string;
  role?: "parent" | "child" | "relative";
  isAdmin?: boolean;
}

export interface AdminUpdateUserDto {
  email?: string;
  name?: string;
  birthDate?: string;
  color?: string;
  phoneNumber?: string;
  role?: "parent" | "child" | "relative";
  isAdmin?: boolean;
}

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

  async getUsersWithFamilies(): Promise<UserFamilies[]> {
    try {
      const result = await fetch(
        `${API_DOMAIN}/api/admin/stats/users-with-families`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!result.ok) {
        throw new Error("Failed to fetch users with families");
      }
      return result.json();
    } catch (error) {
      console.error("Error fetching users with families:", error);
      throw error;
    }
  },

  async getNewUsersStats(interval: "week" | "month"): Promise<ChartDataPoint[]> {
    try {
      const result = await fetch(
        `${API_DOMAIN}/api/admin/stats/new-users/${interval}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!result.ok) {
        throw new Error(`Failed to fetch ${interval}ly new users stats`);
      }
      return result.json();
    } catch (error) {
      console.error(`Error fetching ${interval}ly new users stats:`, error);
      throw error;
    }
  },

  async getFrequencyStats(): Promise<ChartDataPoint[]> {
    try {
      const result = await fetch(`${API_DOMAIN}/api/admin/stats/frequency`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!result.ok) {
        throw new Error("Failed to fetch frequency stats");
      }
      return result.json();
    } catch (error) {
      console.error("Error fetching frequency stats:", error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const result = await fetch(`${API_DOMAIN}/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!result.ok) {
        throw new Error("Failed to fetch all users");
      }
      return result.json();
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  },

  async createUser(data: AdminCreateUserDto) {
    try {
      const result = await fetch(`${API_DOMAIN}/api/users/admin/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!result.ok) {
        const errorData = await result.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create user");
      }
      return result.json();
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async updateUser(userId: string, data: AdminUpdateUserDto) {
    try {
      const result = await fetch(`${API_DOMAIN}/api/users/admin/${userId}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!result.ok) {
        const errorData = await result.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update user");
      }
      return result.json();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  async disableUser(userId: string) {
    try {
      const result = await fetch(`${API_DOMAIN}/api/users/admin/${userId}/disable`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!result.ok) {
        throw new Error("Failed to disable user");
      }
      return result.json();
    } catch (error) {
      console.error("Error disabling user:", error);
      throw error;
    }
  },

  async enableUser(userId: string) {
    try {
      const result = await fetch(`${API_DOMAIN}/api/users/admin/${userId}/enable`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!result.ok) {
        throw new Error("Failed to enable user");
      }
      return result.json();
    } catch (error) {
      console.error("Error enabling user:", error);
      throw error;
    }
  },
};