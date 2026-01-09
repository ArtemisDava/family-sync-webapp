import { useState, useCallback, useEffect, useMemo } from "react";
import { useUser } from "../contexts/user.context";
import { ChildrenService } from "../services/children.service";
import { FamiliesService } from "../services/families.service";
import { EventsService } from "../services/events.service";
import { createFamiliesMap, type FamiliesMap } from "../utils/event.utils";
import type { Family, Children } from "../models/event";
import type { CalendarEvent } from "../models/calendar-event";
import type { CreateEventDto } from "../models/create-event";

type EventsByChild = Record<string, any[]>;

interface UseScheduleDataReturn {
  families: Family[] | null;
  familiesMap: FamiliesMap;
  children: Children[];
  eventsByChild: EventsByChild;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useScheduleData(): UseScheduleDataReturn {
  const { user, token } = useUser();

  const [families, setFamilies] = useState<Family[] | null>(null);
  const [children, setChildren] = useState<Children[]>([]);
  const [eventsByChild, setEventsByChild] = useState<EventsByChild>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    console.log(
      "[loadData] Starting - token:",
      !!token,
      "userId:",
      user?.userId
    );
    if (!token || !user?.userId) {
      console.log("[loadData] Missing token or userId, returning early");
      setLoading(false);
      return;
    }

    try {
      console.log("[loadData] Fetching children and families...");
      setLoading(true);
      setError(null);

      const [fetchedChildren, fetchedFamilies] = await Promise.all([
        ChildrenService.getChildrenByUser(user.userId, token),
        FamiliesService.getFamilies(token),
      ]);
      console.log("[loadData] Families fetched:", fetchedFamilies.length);

      const childrenInFamilies = fetchedFamilies.flatMap((family: Family) =>
        family.children.map((child: Children) => ({
          ...child,
          family: family._id,
        }))
      );
      console.log(
        "[loadData] Children in families:",
        childrenInFamilies.length
      );

      console.log("[loadData] Fetching events for each child...");
      const eventPromises = childrenInFamilies.map(async (child: Children) => ({
        childId: child._id,
        events: await EventsService.getEventsByChild(child._id, token),
      }));

      const eventResults = await Promise.all(eventPromises);
      console.log(
        "[loadData] Events fetched for",
        eventResults.length,
        "children"
      );

      const eventsByChildId: EventsByChild = {};
      for (const { childId, events } of eventResults) {
        eventsByChildId[childId] = events;
      }
      console.log("[loadData] Setting state with events:", eventsByChildId);

      setEventsByChild(eventsByChildId);
      setChildren(childrenInFamilies);
      setFamilies(fetchedFamilies);
      console.log("[loadData] State updated successfully");
    } catch (err) {
      console.error("[loadData] Error:", err);
      setError(err as Error);
    } finally {
      console.log("[loadData] Completed");
      setLoading(false);
    }
  }, [token, user?.userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const familiesMap = useMemo(
    () => createFamiliesMap(families ?? []),
    [families]
  );

  return {
    families,
    familiesMap,
    children,
    eventsByChild,
    loading,
    error,
    refetch: loadData,
  };
}
