import type { Event } from '../models/event';

export const API_DOMAIN =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const STORAGE_KEY_EVENTS = 'familySync_events';

const saveEventsToStorage = (events: Event[]) => {
  localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
};

const loadEventsFromStorage = (): Event[] => {
  const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
  return stored ? JSON.parse(stored) : [];
};

export const EventsService = {
  async getEventsByChild(childId: string, token?: string): Promise<Event[]> {
    if (navigator.onLine) {
      try {
        const response = await fetch(
          `${API_DOMAIN}/api/events/child/${childId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );
        if (response.ok) {
          const serverEvents = await response.json();
          const allEvents = loadEventsFromStorage();
          const updatedEvents = allEvents.filter(event => event.child !== childId).concat(serverEvents);
          saveEventsToStorage(updatedEvents);
          return serverEvents;
        }
      } catch (error) {
        console.error("Error syncing events:", error);
      }
    }

    const cachedEvents = loadEventsFromStorage().filter(event => event.child === childId);
    return cachedEvents;
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
    token?: string,
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
        },
      );
      if (!response.ok) {
        throw new Error("Failed to add event");
      }
      const newEvent = await response.json();
      const allEvents = loadEventsFromStorage();
      allEvents.push(newEvent);
      saveEventsToStorage(allEvents);
      return newEvent;
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

  async addNewEventToAdult(
    familyId: string,
    eventData: {
      title: string;
      startDate: string;
      endDate: string;
      category: string;
      location: string;
      family: string;
      adult?: string;
    },
    token?: string,
  ) {
    try {
      const response = await fetch(
        `${API_DOMAIN}/api/events/adult/${familyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(eventData),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to add event");
      }
      const newEvent = await response.json();
      const allEvents = loadEventsFromStorage();
      allEvents.push(newEvent);
      saveEventsToStorage(allEvents);
      return newEvent;
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  },

  async getEventsByAdult(familyId: string, token?: string): Promise<Event[]> {
    if (navigator.onLine) {
      try {
        const response = await fetch(
          `${API_DOMAIN}/api/events/adult/${familyId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );
        if (response.ok) {
          const serverEvents = await response.json();
          const allEvents = loadEventsFromStorage();
          const updatedEvents = allEvents.filter(event => {
            const eventFamilyId = typeof event.family === 'string' ? event.family : event.family._id;
            return eventFamilyId !== familyId;
          }).concat(serverEvents);
          saveEventsToStorage(updatedEvents);
          return serverEvents; 
        }
      } catch (error) {
        console.error("Error syncing events:", error);
      }
    }

    const cachedEvents = loadEventsFromStorage().filter(event => {
      const eventFamilyId = typeof event.family === 'string' ? event.family : event.family._id;
      return eventFamilyId === familyId;
    });
    return cachedEvents;
  },

  async updateEvent(
    eventId: string,
    eventData: {
      title?: string;
      startDate?: string;
      endDate?: string;
      category?: string;
      location?: string;
    },
    token?: string,
  ) {
    try {
      const response = await fetch(`${API_DOMAIN}/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        throw new Error("Failed to update event");
      }
      return response.json();
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },
};
