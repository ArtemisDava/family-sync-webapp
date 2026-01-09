export const API_DOMAIN =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const EventsService = {
  async getEventsByChild(childId: string, token?: string) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/events/child/${childId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch family");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching family:", error);
      throw error;
    }
  },

  async addNewEventToChild(
    childId: string,
    eventData: {
      title: string;
      startDate: string;
      endDate: string;
      category: string;
      location: string;
      family: string;
    },
    token?: string
  ) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/events/child/${childId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(eventData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add event");
      }
      return response.json();
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  },

  async deleteEvent(eventId: string, token?: string) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};
