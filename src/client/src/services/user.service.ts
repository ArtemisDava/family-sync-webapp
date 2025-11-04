import type LoginInformation from "../models/loginInformation";
import type { LoginDto } from "../models/login.dto";
import type { SignUpDto } from "../models/signup.dto";
import type { SignUpResponseDto } from "../models/signupResponse.dto";
import type { EditableUserFields } from "../models/editableUserFields";

export const API_DOMAIN =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const UserService = {
  async signUp(data: SignUpDto) {
    try {
      const result = await fetch(`${API_DOMAIN}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const resultData: SignUpResponseDto = await result.json();

      return resultData;
    } catch (error) {
      console.error("Error during sign up:", error);
      throw error;
    }
  },

  async login(data: LoginDto): Promise<LoginInformation> {
    const result = await fetch(`${API_DOMAIN}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!result.ok) {
      throw new Error("Login failed");
    }
    const resultData: LoginInformation = await result.json();

    return resultData;
  },

  async updateUser(user: Partial<EditableUserFields>) {
    try {
      const result = await fetch(`${API_DOMAIN}/api/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(user),
      });

      if (!result.ok) {
        throw new Error("Failed to update user");
      }
      return result.json();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  getUser(): LoginInformation | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  async deleteUser(userId: string) {
    try {
      const result = await fetch(`${API_DOMAIN}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!result.ok) {
        throw new Error("Failed to delete user");
      }
      this.logout();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
