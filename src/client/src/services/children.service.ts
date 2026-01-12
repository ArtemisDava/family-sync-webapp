import { type CreateChildDto } from "../models/createChild.dto";

export const API_DOMAIN =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const STORAGE_KEY_CHILDREN = 'familySync_children';

interface Child {
  _id: string;
  name: string;
  birthDate: string;
  color?: string;
  family: { _id: string };
  guardians?: any[];
}

const saveChildrenToStorage = (children: Child[]) => {
  localStorage.setItem(STORAGE_KEY_CHILDREN, JSON.stringify(children));
};

const loadChildrenFromStorage = (): Child[] => {
  const stored = localStorage.getItem(STORAGE_KEY_CHILDREN);
  if (!stored) return [];
  const children = JSON.parse(stored);
  return children.map((child: any) => ({
    ...child,
    family: typeof child.family === 'string' ? { _id: child.family } : child.family
  }));
};

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
    token: string,
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

  async getChildrenByUser(userId: string, token: string): Promise<Child[]> {
    const cachedChildren = loadChildrenFromStorage().filter(child => child.guardians?.some((g: any) => g._id === userId));

    if (navigator.onLine) {
      try {
        const response = await fetch(
          `${API_DOMAIN}/api/children/user/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const serverChildren = await response.json();
          const transformedChildren = serverChildren.map((child: any) => ({
            ...child,
            family: typeof child.family === 'string' ? { _id: child.family } : child.family
          }));
          const allChildren = loadChildrenFromStorage();
          const updatedChildren = allChildren.filter(child => !child.guardians?.includes(userId)).concat(transformedChildren);
          saveChildrenToStorage(updatedChildren);
          return transformedChildren;
        }
      } catch (error) {
        console.error("Error syncing children:", error);
      }
    }

    return cachedChildren;
  },
};
