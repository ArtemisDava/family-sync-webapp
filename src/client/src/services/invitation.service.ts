import type { CreateFamilyInvitationDto } from "../models/create-family-invitation.dto";

export const API_DOMAIN =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const InvitationService = {
  async createInvitation(data: CreateFamilyInvitationDto, token?: string) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/family-invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to create family invitation");
      }
      return response.json();
    } catch (error) {
      console.error("Error creating family invitation:", error);
      throw error;
    }
  },

  async getInvitations(token?: string) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/family-invitation`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch family invitations");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching family invitations:", error);
      throw error;
    }
  },

  async acceptInvitation(invitationId: string, token?: string) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/family-invitation/${invitationId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to accept family invitation");
      }
      return response.json();
    } catch (error) {
      console.error("Error accepting family invitation:", error);
      throw error;
    }
  },

  async rejectInvitation(invitationId: string, token?: string) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/family-invitation/${invitationId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to reject family invitation");
      }
      return response.json();
    } catch (error) {
      console.error("Error rejecting family invitation:", error);
      throw error;
    }
  },

};