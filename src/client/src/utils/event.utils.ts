import type { Event, Family, Children } from "../models/event";
import type { CalendarEvent } from "../models/calendar-event";
import type { CreateEventDto } from "../models/create-event";
import type LoginInformation from "../models/loginInformation";

export type UnpopulatedEvent = Omit<Event, "family"> & { family: string };
export type EventsByChild = Record<string, unknown[]>;
export type FamiliesMap = Map<string, Family>;

export function createFamiliesMap(families: Family[]): FamiliesMap {
  return new Map(families.map((family) => [family._id, family]));
}

export function getFamilyById(
  familiesMap: FamiliesMap,
  familyId: string,
): Family | undefined {
  return familiesMap.get(familyId);
}

export function populateEventFamily(
  event: UnpopulatedEvent,
  familiesOrMap: Family[] | FamiliesMap,
): Event {
  const familiesMap =
    familiesOrMap instanceof Map
      ? familiesOrMap
      : createFamiliesMap(familiesOrMap);
  const family = familiesMap.get(event.family) ?? null;
  return { ...event, family } as Event;
}

export function transformToCalendarEvents(
  eventsByChild: EventsByChild,
  children: Children[],
  disabledChildren: Set<string>,
  user: LoginInformation | null,
): CalendarEvent[] {
  const childrenColorMap = new Map(children.map((c) => [c._id, c.color ?? ""]));
  childrenColorMap.set(user?.userId ?? "", user?.color ?? "");

  const result = children
    .map((child) => {
      return Object.entries(eventsByChild)
        .filter(
          ([childId]) =>
            childId === child._id &&
            !disabledChildren.has(childId + "-" + child.family),
        )
        .flatMap(([childId, events]) =>
          events.map((event: CreateEventDto & { _id: string }) => ({
            ...event,
            start: new Date(event.startDate),
            end: event.endDate
              ? new Date(event.endDate)
              : new Date(event.startDate),
            title: event.title,
            color: childrenColorMap.get(childId) ?? "",
            calendarId: childId,
            childId,
            id: event._id,
          })),
        );
    })
    .flat();

  result.push(
    ...Object.entries(eventsByChild)
      .filter(([childId]) => childId === (user?.userId ?? ""))
      .flatMap(([childId, events]) =>
        events
          .map((event: CreateEventDto & { _id: string }) => {
            if (disabledChildren.has(childId + "-" + event.family)) {
              return null;
            }

            return {
              ...event,
              start: new Date(event.startDate),
              end: event.endDate
                ? new Date(event.endDate)
                : new Date(event.startDate),
              title: event.title,
              color: childrenColorMap.get(childId) ?? "",
              calendarId: childId,
              childId,
              id: event._id,
            };
          })
          .filter((e) => e !== null),
      ),
  );

  return result;
}
