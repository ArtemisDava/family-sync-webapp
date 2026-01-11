import { useState, useCallback, useEffect, useMemo } from "react";
import { useUser } from "../contexts/user.context";
import { FamiliesService } from "../services/families.service";
import { EventsService } from "../services/events.service";
import { createFamiliesMap, type FamiliesMap } from "../utils/event.utils";
import type { Family, Children } from "../models/event";

type EventsByChild = Record<string, unknown[]>;

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
    if (!token || !user?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [fetchedFamilies] = await Promise.all([FamiliesService.getFamilies(token)]);

      const childrenInFamilies = fetchedFamilies.flatMap((family: Family) =>
        family.children.map((child: Children) => ({
          ...child,
          family: family._id,
        })),
      );

      const eventPromises = childrenInFamilies.map(async (child: Children) => ({
        childId: child._id,
        events: await EventsService.getEventsByChild(child._id, token),
      }));
      const eventPromisesAdult = fetchedFamilies.map(
        async (family: Family) => ({
          childId: user.userId,
          events: await EventsService.getEventsByAdult(family._id, token),
        }),
      );

      const eventResults = await Promise.all([
        ...eventPromises,
        ...eventPromisesAdult,
      ]);

      const eventsByChildId: EventsByChild = {};
      for (const { childId, events } of eventResults) {
        eventsByChildId[childId] = events;
      }

      setEventsByChild(eventsByChildId);
      setChildren(childrenInFamilies);
      setFamilies(fetchedFamilies);
    } catch (err) {
      console.error("[loadData] Error:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [token, user?.userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const familiesMap = useMemo(
    () => createFamiliesMap(families ?? []),
    [families],
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
